import React, { useState } from 'react';
import { Message } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Check,
  CheckCheck,
  CheckCircle2,
  Eye,
  AlertCircle,
  Clock,
  MoreVertical,
  Pencil,
  Layers,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageAssets';
import { CopyButton } from '../common/CopyButton';

/** Same category icons as BulkContentSenderView */
const CATEGORY_ICON = {
  flyer: { Icon: Layers, bg: 'bg-blue-600', label: 'Flyer' },
  personalized: { Icon: UserCheck, bg: 'bg-purple-600', label: 'Personalized' },
  normal: { Icon: MessageSquare, bg: 'bg-slate-600', label: 'Normal' }
} as const;

interface Props {
  message: Message;
  isHighlighted?: boolean;
}

export const ContentMessageCard: React.FC<Props> = ({ message, isHighlighted = false }) => {
  const {
    currentUser,
    getMessageAction,
    markAsPosted,
    openNotPostedModal,
    openImageViewer
  } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  // Check whether the message was sent by the current logged-in marketer
  const isMe = Boolean(currentUser && message.senderId === currentUser.id);

  // Retrieve marketer's action for this message
  const action = getMessageAction(message.id);
  const status = action?.status || message.postingStatus || 'pending';

  // Consolidate images array (support `images` array or single `imageUrl`)
  const flyerImages: string[] = (
    message.images && message.images.length > 0
      ? message.images
      : message.imageUrl
      ? [message.imageUrl]
      : []
  ).map((img) => resolveImageUrl(img));

  const imageCount = flyerImages.length;
  const hasImages = imageCount > 0;

  const isFlyer = message.contentCategory === 'flyer';
  const isPersonalized = message.contentCategory === 'personalized';
  const isNormal = message.contentCategory === 'normal';
  // Flyer / Personalized / Normal all use category icon (same as Bulk screen)
  const isCategorized = isFlyer || isPersonalized || isNormal;

  const handlePostedClick = () => {
    if (status === 'posted') return;
    markAsPosted(message.conversationId, message.id);
    setMenuOpen(false);
  };

  const handleNotPostedClick = () => {
    openNotPostedModal(message.conversationId, message.id, message.campaignName);
    setMenuOpen(false);
  };

  const handlePreviewClick = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openImageViewer(flyerImages, idx, message.campaignName || 'Campaign Flyer');
  };

  // Render thumbnail row (max 3 visible)
  const visibleImages = flyerImages.slice(0, 3);
  const remainingCount = flyerImages.length - 3;

  const renderGallery = () => {
    if (imageCount === 1) {
      return (
        <div
          onClick={() => handlePreviewClick(0)}
          className="w-full h-[120px] sm:h-[150px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer"
        >
          <img
            src={flyerImages[0]}
            alt="Flyer 1"
            className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }
    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full">
          {visibleImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => handlePreviewClick(idx)}
              className="w-full h-[76px] sm:h-[96px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer"
            >
              <img
                src={img}
                alt={`Flyer ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {visibleImages.map((img, idx) => {
          const isThirdWithRemaining = idx === 2 && remainingCount > 0;
          return (
            <div
              key={idx}
              onClick={() => handlePreviewClick(idx)}
              className="relative w-full h-[76px] sm:h-[96px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer group/thumb"
            >
              <img
                src={img}
                alt={`Flyer ${idx + 1}`}
                className="w-full h-full object-cover group-hover/thumb:scale-[1.02] transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
              {isThirdWithRemaining && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  +{remainingCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderPostingFooter = () => {
    if (status === 'posted') {
      return (
        <div className="bg-[#ecfdf5] border border-emerald-100/90 rounded-xl px-2.5 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-emerald-900 block leading-tight">
                Posted
              </span>
              <span className="text-[10.5px] text-emerald-600 block leading-tight truncate">
                {action?.postedAt ? `Posted at ${action.postedAt}` : `Posted at Today at 09:15 AM`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openImageViewer(flyerImages, 0, cardTitle)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Details</span>
          </button>
        </div>
      );
    }

    if (status === 'not_posted') {
      return (
        <div className="bg-[#fff7ed] border border-amber-100/90 rounded-xl px-2.5 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-950 block leading-tight">
                Not Posted
              </span>
              <span className="text-[10.5px] text-amber-700 block leading-tight truncate">
                {action?.reason || 'Waiting for client approval.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNotPostedClick}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Pencil className="w-3 h-3 text-amber-600" />
            <span>Edit</span>
          </button>
        </div>
      );
    }

    return (
      <div className="bg-[#fff7ed] border border-amber-100/90 rounded-xl px-2.5 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-950 block leading-tight">
              Pending
            </span>
            <span className="text-[10.5px] text-amber-700 block leading-tight truncate">
              Requires client approval.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePostedClick}
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Mark as Posted"
          >
            <Check className="w-3 h-3" />
            <span>Post</span>
          </button>
          <button
            type="button"
            onClick={handleNotPostedClick}
            className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Edit / Not Posted"
          >
            <Pencil className="w-3 h-3 text-amber-600" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    );
  };

  // Title = campaign name only (no category label pills)
  const cardTitle = message.campaignName?.trim() || '';
  const messageBody = message.text?.trim() || '';
  const showMessageBody = Boolean(messageBody && messageBody !== cardTitle);

  const categoryKey = isPersonalized
    ? 'personalized'
    : isNormal
      ? 'normal'
      : 'flyer';
  const { Icon: IconComponent, bg: iconBg, label: categoryLabel } =
    CATEGORY_ICON[isCategorized ? categoryKey : 'flyer'];

  const showPostingFooter = Boolean(
    !isNormal && (isFlyer || message.isPostable || hasImages)
  );

  // =========================================================================
  // 1. SENT MESSAGE (RIGHT ALIGNED — SENT BY LOGGED-IN USER)
  // =========================================================================
  if (isMe) {
    // If sent message is a categorized Flyer or Personalized content card
    if (isCategorized) {
      return (
        <div className="flex justify-end w-full group">
          <div className="flex flex-col items-end w-full max-w-[80%] sm:max-w-[68%] space-y-1">
            {/* Main Card */}
            <div
              className={`w-full bg-white rounded-[16px] border border-blue-200/90 shadow-xs p-2.5 sm:p-3 space-y-2.5 overflow-hidden text-left transition-all duration-200 ${
                isHighlighted ? 'ring-2 ring-blue-500 shadow-md border-blue-400' : ''
              }`}
            >
              {/* Header: category icon + title only */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5 ${iconBg}`}
                    title={categoryLabel}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {cardTitle ? (
                    <h3 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight min-w-0 pt-1">
                      {cardTitle}
                    </h3>
                  ) : null}
                </div>

                {hasImages && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              openImageViewer(flyerImages, 0, cardTitle || categoryLabel);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Flyers</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {hasImages && renderGallery()}

              {showMessageBody && (
                <div className="flex items-start gap-1.5">
                  <p className="flex-1 min-w-0 text-[13px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {messageBody}
                  </p>
                  <CopyButton textToCopy={messageBody} tooltipPosition="top" />
                </div>
              )}

              {showPostingFooter && renderPostingFooter()}
            </div>

            {/* Sent Metadata Row */}
            <div className="flex items-center justify-end gap-1 px-1 text-xs text-slate-400 select-none">
              <span className="text-[11px] font-normal text-slate-400">
                {message.timestamp}
              </span>
              <CheckCheck className="w-3.5 h-3.5 text-[#0066f5]" />
            </div>
          </div>
        </div>
      );
    }

    // Default standard sent text message
    return (
      <div className="flex justify-end w-full group">
        <div className="flex flex-col items-end w-full max-w-[76%] sm:max-w-[62%] space-y-1">
          {/* Sent Message Bubble */}
          <div
            className={`w-fit max-w-full rounded-2xl rounded-tr-xs p-3.5 bg-[#0066f5] text-white shadow-xs transition-all duration-300 ${
              isHighlighted ? 'ring-2 ring-blue-300 shadow-md' : ''
            }`}
          >
            {message.text && (
              <div className="flex items-start gap-1.5">
                <p className="flex-1 min-w-0 text-[13.5px] text-white leading-relaxed font-normal whitespace-pre-wrap">
                  {message.text}
                </p>
                <CopyButton
                  textToCopy={message.text}
                  className="text-white/70 hover:text-white hover:bg-white/15"
                  tooltipPosition="top"
                />
              </div>
            )}

            {hasImages && (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {flyerImages.slice(0, 2).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePreviewClick(idx)}
                    className="relative rounded-xl overflow-hidden aspect-4/3 bg-black/10 cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`Attached ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Metadata Row: Time & Delivery Status */}
          <div className="flex items-center justify-end gap-1 px-1 text-xs text-slate-400 select-none">
            <span className="text-[11px] font-normal text-slate-400">
              {message.timestamp}
            </span>
            <CheckCheck className="w-3.5 h-3.5 text-[#0066f5]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RECEIVED MESSAGE (LEFT ALIGNED — RECEIVED FROM CONTACT)
  // =========================================================================

  // If text-only message and NOT categorized
  if (!hasImages && !isCategorized) {
    return (
      <div className="flex flex-col items-start w-full group">
        <div className="flex flex-col items-start w-full max-w-[80%] sm:max-w-[68%] space-y-1">
          {/* Top metadata line outside bubble */}
          <div className="flex items-center justify-between w-full px-1 text-xs select-none">
            <span className="font-normal text-slate-500 text-xs truncate">
              {message.senderName}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {message.timestamp}
            </span>
          </div>

          {/* Plain chat (no category) — no category icon */}
          <div
            className={`w-fit max-w-full rounded-2xl rounded-tl-xs p-3.5 bg-white border border-slate-200/70 shadow-xs ${
              isHighlighted ? 'ring-2 ring-blue-500 shadow-md border-blue-400' : ''
            }`}
          >
            {message.text && (
              <div className="flex items-start gap-1.5">
                <p className="flex-1 min-w-0 text-[13.5px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {message.text}
                </p>
                <CopyButton textToCopy={message.text} tooltipPosition="top" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Received Flyer / Personalized / Normal card (Bulk icons — no label pills)
  return (
    <div className="flex flex-col items-start w-full group">
      <div className="flex flex-col items-start w-full max-w-[82%] sm:max-w-[70%] space-y-1">
        <div className="flex items-center justify-between w-full px-1 text-xs select-none">
          <span className="font-normal text-slate-500 text-xs truncate">
            {message.senderName}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {message.timestamp}
          </span>
        </div>

        <div
          className={`w-full bg-white rounded-[16px] border border-slate-200/80 shadow-xs p-2.5 sm:p-3 space-y-2.5 overflow-hidden transition-all duration-200 ${
            isHighlighted ? 'ring-2 ring-blue-500 shadow-md border-blue-400' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5 ${iconBg}`}
                title={categoryLabel}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              {cardTitle ? (
                <h3 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight min-w-0 pt-1">
                  {cardTitle}
                </h3>
              ) : null}
            </div>

            {!isNormal && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700 animate-in fade-in-50 zoom-in-95">
                      {hasImages && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            openImageViewer(flyerImages, 0, cardTitle || categoryLabel);
                          }}
                          className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Flyers</span>
                        </button>
                      )}
                      {(isFlyer || message.isPostable) && status !== 'posted' && (
                        <button
                          type="button"
                          onClick={handlePostedClick}
                          className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark as Posted</span>
                        </button>
                      )}
                      {(isFlyer || message.isPostable) && (
                        <button
                          type="button"
                          onClick={handleNotPostedClick}
                          className="w-full px-3 py-1.5 text-left hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          <span>Edit Reason</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {hasImages && renderGallery()}

          {showMessageBody && (
            <div className="flex items-start gap-1.5">
              <p className="flex-1 min-w-0 text-[13px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                {messageBody}
              </p>
              <CopyButton textToCopy={messageBody} tooltipPosition="top" />
            </div>
          )}

          {showPostingFooter && renderPostingFooter()}
        </div>
      </div>
    </div>
  );
};
