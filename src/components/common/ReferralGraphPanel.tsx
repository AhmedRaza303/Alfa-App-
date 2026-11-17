import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReferralNode } from '../../utils/referrals';
import { ApprovalStatus, User } from '../../types';
import { GitBranch, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

type LaidOut = {
  id: string;
  user: User;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
  directCount: number;
  totalCount: number;
};

const NODE_W = 118;
const NODE_H = 48;
const GAP_X = 28;
const GAP_Y = 12;
const PAD = 14;

function statusMeta(status: ApprovalStatus | undefined) {
  if (status === 'pending') {
    return {
      ring: 'ring-amber-400/80',
      bar: 'bg-amber-400',
      chip: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Pending'
    };
  }
  if (status === 'rejected') {
    return {
      ring: 'ring-rose-400/80',
      bar: 'bg-rose-400',
      chip: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Rejected'
    };
  }
  return {
    ring: 'ring-emerald-400/80',
    bar: 'bg-emerald-400',
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Approved'
  };
}

function layoutTree(root: ReferralNode, startY: number): { nodes: LaidOut[]; height: number } {
  const nodes: LaidOut[] = [];
  let leafY = startY;

  const walk = (node: ReferralNode, depth: number, parentId: string | null): number => {
    if (node.children.length === 0) {
      const y = leafY;
      leafY += NODE_H + GAP_Y;
      nodes.push({
        id: node.user.id,
        user: node.user,
        depth,
        x: PAD + depth * (NODE_W + GAP_X),
        y: PAD + y,
        parentId,
        directCount: node.directCount,
        totalCount: node.totalCount
      });
      return y;
    }

    const childYs = node.children.map((c) => walk(c, depth + 1, node.user.id));
    const y = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    nodes.push({
      id: node.user.id,
      user: node.user,
      depth,
      x: PAD + depth * (NODE_W + GAP_X),
      y: PAD + y,
      parentId,
      directCount: node.directCount,
      totalCount: node.totalCount
    });
    return y;
  };

  walk(root, 0, null);
  return { nodes, height: Math.max(leafY, NODE_H + GAP_Y) };
}

function layoutForest(forest: ReferralNode[]) {
  let yCursor = 0;
  const all: LaidOut[] = [];
  let maxDepth = 0;
  let maxX = NODE_W;

  for (const root of forest) {
    const { nodes, height } = layoutTree(root, yCursor);
    all.push(...nodes);
    yCursor += height + 16;
    for (const n of nodes) {
      maxDepth = Math.max(maxDepth, n.depth);
      maxX = Math.max(maxX, n.x + NODE_W);
    }
  }

  return {
    nodes: all,
    width: maxX + PAD,
    height: Math.max(yCursor - 16, NODE_H) + PAD * 2,
    maxDepth
  };
}

export type ReferralGraphPanelProps = {
  forest: ReferralNode[];
  /** Header stats left of zoom controls */
  statsLabel?: string;
  showRootFilter?: boolean;
  footerAction?: React.ReactNode;
  emptyHint?: string;
};

export const ReferralGraphPanel: React.FC<ReferralGraphPanelProps> = ({
  forest,
  statsLabel,
  showRootFilter = false,
  footerAction,
  emptyHint = 'No referrals yet.'
}) => {
  const [expanded, setExpanded] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [rootFilter, setRootFilter] = useState<string | 'all'>('all');
  const [zoom, setZoom] = useState(1);
  const [boxW, setBoxW] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const visibleForest = useMemo(() => {
    if (!showRootFilter || rootFilter === 'all') return forest;
    return forest.filter((r) => r.user.id === rootFilter);
  }, [forest, rootFilter, showRootFilter]);

  const laid = useMemo(() => layoutForest(visibleForest), [visibleForest]);

  const byId = useMemo(() => {
    const m = new Map<string, LaidOut>();
    laid.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [laid.nodes]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setBoxW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, visibleForest.length]);

  const fitScale = useMemo(() => {
    if (!boxW || !laid.width) return 1;
    const maxH = expanded ? 340 : 220;
    const sx = (boxW - 4) / laid.width;
    const sy = (maxH - 4) / laid.height;
    return Math.min(1, sx, sy);
  }, [boxW, laid.width, laid.height, expanded]);

  const scale = Math.max(0.45, Math.min(1.35, fitScale * zoom));
  const stageH = Math.ceil(laid.height * scale);
  const hover = hoverId ? byId.get(hoverId) : null;

  const focusSet = useMemo(() => {
    if (!focusId) return null;
    const ids = new Set<string>([focusId]);
    const f = byId.get(focusId);
    if (f?.parentId) ids.add(f.parentId);
    laid.nodes.forEach((n) => {
      if (n.parentId === focusId) ids.add(n.id);
    });
    return ids;
  }, [focusId, byId, laid.nodes]);

  const edges = useMemo(() => {
    return laid.nodes
      .filter((n) => n.parentId)
      .map((n) => {
        const p = byId.get(n.parentId!);
        if (!p) return null;
        const x1 = p.x + NODE_W;
        const y1 = p.y + NODE_H / 2;
        const x2 = n.x;
        const y2 = n.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        const active = !focusSet || focusSet.has(n.id) || focusSet.has(p.id);
        return {
          id: `${p.id}-${n.id}`,
          d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
          active
        };
      })
      .filter(Boolean) as { id: string; d: string; active: boolean }[];
  }, [laid.nodes, byId, focusSet]);

  const defaultStats = `${laid.nodes.length} · L${laid.maxDepth}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Referral graph
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 tabular-nums mr-0.5">
            {statsLabel || defaultStats}
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-center cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-center cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded((v) => !v);
              setZoom(1);
            }}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-center cursor-pointer"
            title={expanded ? 'Compact' : 'Expand'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {forest.length === 0 || laid.nodes.length === 0 ? (
        <p className="px-3 pb-3 text-[11px] text-slate-400">{emptyHint}</p>
      ) : (
        <>
          {showRootFilter && forest.length > 1 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setRootFilter('all');
                  setFocusId(null);
                  setZoom(1);
                }}
                className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                  rootFilter === 'all'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                All
              </button>
              {forest.map((r) => (
                <button
                  key={r.user.id}
                  type="button"
                  onClick={() => {
                    setRootFilter(r.user.id);
                    setFocusId(null);
                    setZoom(1);
                  }}
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                    rootFilter === r.user.id
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <img
                    src={r.user.avatar}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {r.user.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          <div
            ref={viewportRef}
            className="relative mx-3 mb-2 rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] overflow-hidden"
            style={{ height: Math.max(stageH + 8, expanded ? 280 : 200) }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: laid.width,
                height: laid.height,
                transform: `scale(${scale})`
              }}
            >
              <svg
                className="absolute inset-0 pointer-events-none"
                width={laid.width}
                height={laid.height}
              >
                {edges.map((e) => (
                  <path
                    key={e.id}
                    d={e.d}
                    fill="none"
                    stroke={e.active ? '#38bdf8' : '#cbd5e1'}
                    strokeWidth={e.active ? 2 : 1.5}
                    strokeOpacity={focusSet && !e.active ? 0.3 : 1}
                  />
                ))}
              </svg>

              {laid.nodes.map((n) => {
                const meta = statusMeta(n.user.approvalStatus);
                const isFocus = focusId === n.id;
                const faded = Boolean(focusSet && !focusSet.has(n.id));

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setFocusId((prev) => (prev === n.id ? null : n.id))}
                    onMouseEnter={() => setHoverId(n.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`absolute text-left rounded-xl border bg-white shadow-sm transition-all cursor-pointer overflow-hidden ${
                      isFocus
                        ? 'border-sky-400 ring-2 ring-sky-200 shadow-md z-10'
                        : 'border-slate-200 hover:border-sky-300 hover:shadow-md'
                    } ${faded ? 'opacity-35' : 'opacity-100'}`}
                    style={{
                      left: n.x,
                      top: n.y,
                      width: NODE_W,
                      height: NODE_H
                    }}
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${meta.bar}`} />
                    <span className="flex items-center gap-1.5 h-full pl-2.5 pr-1.5">
                      <img
                        src={n.user.avatar}
                        alt=""
                        className={`w-7 h-7 rounded-lg object-cover ring-2 ring-offset-1 ${meta.ring} shrink-0`}
                        referrerPolicy="no-referrer"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-extrabold text-slate-900 truncate leading-tight">
                          {n.user.name.split(' ')[0]}
                        </span>
                        <span className="block text-[9px] font-semibold text-slate-400 truncate leading-tight mt-0.5">
                          {n.depth === 0 ? 'You' : `L${n.depth}`}
                          {n.directCount > 0 ? ` · +${n.directCount}` : ''}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 pb-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
            {hover || (focusId && byId.get(focusId)) ? (
              (() => {
                const n = hover || byId.get(focusId!)!;
                const meta = statusMeta(n.user.approvalStatus);
                return (
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={n.user.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{n.user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {n.user.referralCode || '—'}
                        {n.user.company ? ` · ${n.user.company}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${meta.chip}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })()
            ) : (
              <p className="text-[10px] text-slate-400 font-medium">
                Fit view on · tap node to focus
              </p>
            )}
            {footerAction}
          </div>
        </>
      )}
    </section>
  );
};
