import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPage } from '../../types';
import { ArrowRight, ArrowLeft, X, Check, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  page: TourPage;
  /** Skip welcome card; do not persist completion */
  isReplay?: boolean;
  onClose: () => void;
}

type TourStep = {
  target: string;
  title: string;
  desc: string;
};

const PAD = 8;

export const WelcomeTourModal: React.FC<Props> = ({
  isOpen,
  page,
  isReplay = false,
  onClose
}) => {
  const { t, completePageTour, currentUser } = useApp();
  const [phase, setPhase] = useState<'welcome' | 'tour'>('tour');
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const isTourDemo = Boolean(currentUser?.isTourDemo);
  const pagesDone = currentUser?.completedTourPages || [];
  const isFirstEverVisit = pagesDone.length === 0 && !isReplay;

  const steps = useMemo((): TourStep[] => {
    const byPage: Record<TourPage, TourStep[]> = {
      conversations: [
        {
          target: 'nav-conversations',
          title: t.tourNavChatsTitle,
          desc: t.tourNavChatsDesc
        },
        {
          target: 'chat-filters',
          title: t.tourChatFiltersTitle,
          desc: t.tourChatFiltersDesc
        },
        {
          target: 'chat-messages',
          title: t.tourChatMessagesTitle,
          desc: t.tourChatMessagesDesc
        },
        {
          target: 'chat-actions',
          title: t.tourChatActionsTitle,
          desc: t.tourChatActionsDesc
        }
      ],
      leads: [
        {
          target: 'nav-leads',
          title: t.tourNavLeadsTitle,
          desc: t.tourNavLeadsDesc
        },
        {
          target: 'leads-toolbar',
          title: t.tourLeadsToolsTitle,
          desc: t.tourLeadsToolsDesc
        },
        {
          target: 'leads-list',
          title: t.tourLeadsListTitle,
          desc: t.tourLeadsListDesc
        }
      ],
      performance: [
        {
          target: 'nav-performance',
          title: t.tourNavStatsTitle,
          desc: t.tourNavStatsDesc
        },
        {
          target: 'stats-overview',
          title: t.tourStatsOverviewTitle,
          desc: t.tourStatsOverviewDesc
        }
      ],
      referrals: [
        {
          target: 'nav-referrals',
          title: t.tourNavReferralTitle,
          desc: t.tourNavReferralDesc
        },
        {
          target: 'referral-invite',
          title: t.tourReferralInviteTitle,
          desc: t.tourReferralInviteDesc
        },
        {
          target: 'referral-downline',
          title: t.tourReferralDownlineTitle,
          desc: t.tourReferralDownlineDesc
        }
      ],
      notifications: [
        {
          target: 'nav-notifications',
          title: t.tourNavAlertsTitle,
          desc: t.tourNavAlertsDesc
        },
        {
          target: 'alerts-list',
          title: t.tourAlertsListTitle,
          desc: t.tourAlertsListDesc
        }
      ]
    };
    return byPage[page] || [];
  }, [t, page]);

  const measure = useCallback((target: string, scrollIntoView: boolean) => {
    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    if (scrollIntoView) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
    setRect(el.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (!isReplay && isFirstEverVisit && page === 'conversations') {
      setPhase('welcome');
    } else {
      setPhase('tour');
    }
    setCurrentStep(0);
    setRect(null);
  }, [isOpen, isReplay, isFirstEverVisit, page]);

  useEffect(() => {
    if (!isOpen || phase !== 'tour' || steps.length === 0) return;
    const idx = Math.min(currentStep, steps.length - 1);
    if (idx !== currentStep) {
      setCurrentStep(idx);
      return;
    }
    const step = steps[idx];
    if (!step) return;
    setRect(null);
    const t1 = window.setTimeout(() => measure(step.target, true), 100);
    const t2 = window.setTimeout(() => measure(step.target, false), 320);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [currentStep, phase, isOpen, measure, page, steps]);

  useLayoutEffect(() => {
    if (!isOpen || phase !== 'tour' || steps.length === 0) return;
    const onResize = () => {
      const step = steps[Math.min(currentStep, steps.length - 1)];
      if (step) measure(step.target, false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen, phase, currentStep, measure, page, steps]);

  if (!isOpen || steps.length === 0) return null;

  // Clamp when switching pages (e.g. Chats 4 steps → Alerts 2 steps)
  const safeStep = Math.min(currentStep, steps.length - 1);
  const activeStep = steps[safeStep];
  if (!activeStep) return null;

  const persistAndClose = () => {
    if (!isReplay && !isTourDemo) completePageTour(page);
    onClose();
  };

  const handleStartTour = () => {
    setPhase('tour');
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (safeStep < steps.length - 1) {
      setCurrentStep(safeStep + 1);
    } else {
      persistAndClose();
    }
  };

  const handlePrev = () => {
    if (safeStep > 0) setCurrentStep(safeStep - 1);
  };

  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div className="fixed inset-0 bg-slate-900/45 pointer-events-auto" onClick={persistAndClose} />
        <div className="pointer-events-auto relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4 mb-16 sm:mb-0">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.welcomeTitle}</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.welcomeDesc}</p>
          </div>
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={handleStartTour}
              className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.startTour}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={persistAndClose}
              className="w-full min-h-[40px] py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {t.skipForNow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLast = safeStep === steps.length - 1;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const maxHoleH = Math.round(vh * 0.42);
  const holeH = rect ? Math.min(maxHoleH, rect.height + PAD * 2) : 0;
  const holeTop = rect
    ? Math.max(4, Math.min(rect.top - PAD, vh - holeH - 4))
    : 0;

  const highlightStyle: React.CSSProperties | undefined = rect
    ? {
        position: 'fixed',
        top: holeTop,
        left: Math.max(4, rect.left - PAD),
        width: Math.min(vw - 8, rect.width + PAD * 2),
        height: holeH,
        borderRadius: 14,
        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
        border: '2px solid rgb(37, 99, 235)',
        pointerEvents: 'none',
        zIndex: 61
      }
    : undefined;

  const holeBottom = holeTop + holeH;
  const tooltipAbove = rect ? holeBottom > vh * 0.55 : false;
  const tooltipStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(22rem, calc(100vw - 1.5rem))',
        ...(tooltipAbove
          ? { bottom: Math.max(72, vh - holeTop + 10) }
          : { top: Math.min(vh - 220, holeBottom + 10) }),
        zIndex: 62
      }
    : {
        position: 'fixed',
        left: '50%',
        bottom: 88,
        transform: 'translateX(-50%)',
        width: 'min(22rem, calc(100vw - 1.5rem))',
        zIndex: 62
      };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none" aria-modal="true" role="dialog">
      {/* Dim only — leave BottomNav clickable (nav is z-[70] while tour is open) */}
      {!rect && (
        <div
          className="absolute inset-0 bg-slate-900/50 pointer-events-auto"
          style={{ bottom: 56 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {rect && <div style={highlightStyle} />}

      {/* Block page content clicks but leave bottom nav free */}
      {rect && (
        <div
          className="absolute left-0 right-0 top-0 pointer-events-auto"
          style={{ bottom: 56, zIndex: 60 }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div style={tooltipStyle} className="pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {t.stepOf(safeStep + 1, steps.length)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={persistAndClose}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                {t.skipTour}
              </button>
              <button
                type="button"
                onClick={persistAndClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{activeStep.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeStep.desc}</p>
          </div>

          <div className="flex items-center justify-center gap-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === safeStep ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={safeStep === 0}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                safeStep === 0
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.previous}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="min-h-[40px] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLast ? t.finish : t.next}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
