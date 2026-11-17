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
  MessageSquare,
  Languages
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageAssets';
import { CopyButton } from '../common/CopyButton';

/** Predefined card design per content category (icon + colors) */
const CATEGORY_CARD = {
  flyer: {
    Icon: Layers,
    label: 'Flyer',
    iconBg: 'bg-blue-600',
    card: 'bg-blue-50/80 border-blue-200',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200/80'
  },
  personalized: {
    Icon: UserCheck,
    label: 'Personalized',
    iconBg: 'bg-violet-600',
    card: 'bg-violet-50/80 border-violet-200',
    accent: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-800 border-violet-200/80'
  },
  normal: {
    Icon: MessageSquare,
    label: 'Normal',
    iconBg: 'bg-slate-600',
    card: 'bg-slate-50 border-slate-200',
    accent: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  }
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
    openLanguageRequestModal,
    openImageViewer,
    getLanguageRequestForMessage
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

  const videoUrls: string[] = (message.videos || []).filter(Boolean);
  const imageCount = flyerImages.length;
  const hasImages = imageCount > 0;
  const hasVideos = videoUrls.length > 0;

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

  const messageLanguage = message.contentLanguage || 'en';
  const languageRequest = getLanguageRequestForMessage(message.id);

  const handleLanguageRequestClick = () => {
    openLanguageRequestModal(
      message.conversationId,
      message.id,
      message.campaignName,
      messageLanguage
    );
    setMenuOpen(false);
  };

  const handlePreviewClick = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openImageViewer(flyerImages, idx, message.campaignName || 'Campaign Flyer');
  };

  const imageGridClass =
    imageCount <= 1
      ? 'grid-cols-1'
      : imageCount === 2
        ? 'grid-cols-2'
        : imageCount === 4
          ? 'grid-cols-2'
          : 'grid-cols-3';

  const renderGallery = () => {
    if (!hasImages) return null;
    const visibleImages = flyerImages.slice(0, 5);
    const remainingCount = flyerImages.length - visibleImages.length;

    if (imageCount === 1 && !hasVideos) {
      return (
        <div
          onClick={() => handlePreviewClick(0)}
          className="w-full aspect-video max-h-[160px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer"
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

    return (
      <div className={`grid ${imageGridClass} gap-1.5 w-full min-w-0`}>
        {visibleImages.map((img, idx) => {
          const isLastWithRemaining =
            idx === visibleImages.length - 1 && remainingCount > 0;
          return (
            <div
              key={idx}
              onClick={() => handlePreviewClick(idx)}
              className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer group/thumb"
            >
              <img
                src={img}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-cover group-hover/thumb:scale-[1.02] transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
              {isLastWithRemaining && (
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
        <div className="bg-[#fff7ed] border border-amber-100/90 rounded-xl px-2.5 sm:px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-950 block leading-tight">
              Need Revision
            </span>
            <span className="text-[10.5px] text-amber-700 block leading-tight truncate">
              {action?.reason || 'Waiting for client approval.'}
            </span>
          </div>
        </div>
      );
    }

    // Pending — actions live in the ⋮ menu only
    return (
      <div className="bg-[#fff7ed] border border-amber-100/90 rounded-xl px-2.5 sm:px-3 py-2 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="min-w-0">
          <span className="text-xs font-bold text-amber-950 block leading-tight">Pending</span>
          <span className="text-[10.5px] text-amber-700 block leading-tight truncate">
            Use ⋮ menu to mark Posted or Need Revision.
          </span>
        </div>
      </div>
    );
  };

  const renderLanguageRequestBanner = () => {
    if (!languageRequest) return null;
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 sm:px-3 py-2 flex items-center gap-2">
        <Languages className="w-5 h-5 text-indigo-600 shrink-0" />
        <div className="min-w-0">
          <span className="text-xs font-bold text-indigo-950 block leading-tight">
            Language requested: {languageRequest.requestedLanguageLabel}
          </span>
          <span className="text-[10.5px] text-indigo-700 block leading-tight truncate">
            {languageRequest.status === 'pending'
              ? 'Waiting for Admin to send this version.'
              : languageRequest.status === 'fulfilled'
                ? 'Fulfilled by Admin.'
                : 'Request cancelled.'}
          </span>
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
  const category = CATEGORY_CARD[isCategorized ? categoryKey : 'flyer'];
  const { Icon: IconComponent, iconBg, label: categoryLabel, card: cardTone, accent, badge } =
    category;

  const showPostingFooter = Boolean(
    !isNormal && (isFlyer || message.isPostable || hasImages || hasVideos)
  );

  const renderCategoryHeader = (menu?: React.ReactNode) => (
    <div className="flex items-start justify-between gap-2 min-w-0">
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs ${iconBg}`}
          title={categoryLabel}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${badge}`}
          >
            {categoryLabel}
          </span>
          {(cardTitle || !isCategorized) && (
            <h3
              className="mt-1 text-[13px] font-bold text-slate-900 leading-snug tracking-tight truncate"
              title={cardTitle || categoryLabel}
            >
              {cardTitle || categoryLabel}
            </h3>
          )}
        </div>
      </div>
      {menu}
    </div>
  );

  const renderVideos = () => {
    if (!hasVideos) return null;
    const videoCols =
      videoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2';

    return (
      <div className={`grid ${videoCols} gap-1.5 w-full min-w-0`}>
        {videoUrls.map((src, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-video max-h-[148px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/60"
          >
            <video
              src={src}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              Your browser does not support video playback.
            </video>
          </div>
        ))}
      </div>
    );
  };

  const renderMediaBlock = () => {
    if (!hasImages && !hasVideos) return null;
    return (
      <div className="w-full min-w-0 space-y-1.5">
        {renderGallery()}
        {renderVideos()}
      </div>
    );
  };

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
              className={`relative w-full min-w-0 rounded-[16px] border shadow-xs p-2.5 sm:p-3 space-y-2.5 text-left transition-all duration-200 overflow-hidden ${cardTone} ${
                isHighlighted ? 'ring-2 ring-blue-500 shadow-md border-blue-400' : ''
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
              {renderCategoryHeader(
                (hasImages || hasVideos) ? (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700">
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
                              <span>View media</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : undefined
              )}

              {renderMediaBlock()}

              {showMessageBody && (
                <div className="flex items-start gap-1.5 min-w-0">
                  <p className="flex-1 min-w-0 text-[13px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap break-words">
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
            className={`relative w-fit max-w-full rounded-2xl rounded-tr-xs p-3.5 bg-[#0066f5] text-white shadow-xs transition-all duration-300 ${
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
            {hasVideos && (
              <div className="mt-2.5 grid grid-cols-1 gap-1.5 min-w-0">
                {videoUrls.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-video max-h-[140px] rounded-xl overflow-hidden bg-black"
                  >
                    <video
                      src={src}
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-contain"
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
  if (!hasImages && !hasVideos && !isCategorized) {
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
            className={`relative w-fit max-w-full rounded-2xl rounded-tl-xs p-3.5 bg-white border border-slate-200/70 shadow-xs ${
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
          className={`relative w-full min-w-0 rounded-[16px] border shadow-xs p-2.5 sm:p-3 space-y-2.5 transition-all duration-200 overflow-hidden ${cardTone} ${
            isHighlighted ? 'ring-2 ring-blue-500 shadow-md border-blue-400' : ''
          }`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
          {renderCategoryHeader(
            !isNormal ? (
              <div className="relative shrink-0" data-tour="chat-actions">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                  title="Actions"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-50 text-xs font-medium text-slate-700 animate-in fade-in-50 zoom-in-95">
                      {hasImages && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            openImageViewer(flyerImages, 0, cardTitle || categoryLabel);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View media</span>
                        </button>
                      )}
                      {(isFlyer || message.isPostable) && status !== 'posted' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            handlePostedClick();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark as Posted</span>
                        </button>
                      )}
                      {(isFlyer || message.isPostable) && status !== 'posted' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            handleNotPostedClick();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          <span>Need Revision</span>
                        </button>
                      )}
                      {(isFlyer || message.isPostable || isPersonalized) && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            handleLanguageRequestClick();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-indigo-50 text-indigo-800 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Languages className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Need Another Language</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : undefined
          )}

          {renderMediaBlock()}

          {showMessageBody && (
            <div className="flex items-start gap-1.5 min-w-0">
              <p className="flex-1 min-w-0 text-[13px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap break-words">
                {messageBody}
              </p>
              <CopyButton textToCopy={messageBody} tooltipPosition="top" />
            </div>
          )}

          {showPostingFooter && renderPostingFooter()}
          {renderLanguageRequestBanner()}
        </div>
      </div>
    </div>
  );
};
