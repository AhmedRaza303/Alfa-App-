import React from 'react';
import { Message, ReactionEmoji } from '../../types';
import { useApp } from '../../context/AppContext';

export const REACTION_OPTIONS: ReactionEmoji[] = ['👍', '❤️', '🔥', '👏', '✅', '😂'];

type Props = {
  message: Message;
  /** Align under card — start (received) or end (sent) */
  align?: 'start' | 'end';
};

/** Teams-style reactions: sit on the bottom edge of the message card */
export const MessageReactions: React.FC<Props> = ({ message, align = 'start' }) => {
  const { currentUser, toggleReaction } = useApp();

  if (!currentUser) return null;

  const reactions = message.reactions || [];
  const counts = new Map<ReactionEmoji, { count: number; mine: boolean }>();
  for (const r of reactions) {
    const prev = counts.get(r.emoji) || { count: 0, mine: false };
    counts.set(r.emoji, {
      count: prev.count + 1,
      mine: prev.mine || r.userId === currentUser.id
    });
  }

  const handleToggle = (emoji: ReactionEmoji) => {
    toggleReaction(message.conversationId, message.id, emoji);
  };

  const hasCounts = counts.size > 0;

  return (
    <div
      className={`relative z-10 ${
        hasCounts
          ? `flex items-center gap-1 px-1.5 -mt-3 mb-0.5 ${
              align === 'end' ? 'justify-end' : 'justify-start'
            }`
          : 'h-0'
      }`}
    >
      {/* Hover picker — Teams-style near bottom edge of card */}
      <div
        className={`absolute z-30 opacity-0 scale-95 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto ${
          hasCounts ? '-top-9' : '-top-3'
        } ${align === 'end' ? 'right-1' : 'left-1'}`}
      >
        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full border border-slate-200 bg-white shadow-md">
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(emoji);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-125 hover:bg-slate-100"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Reaction pills on bottom edge of card (Teams) */}
      {hasCounts &&
        Array.from(counts.entries()).map(([emoji, info]) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleToggle(emoji)}
            className={`inline-flex items-center gap-0.5 h-6 pl-1 pr-1.5 rounded-full border bg-white shadow-sm text-[11px] font-bold cursor-pointer transition-colors ${
              info.mine
                ? 'border-blue-400 ring-1 ring-blue-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            title={info.mine ? 'Remove your reaction' : 'React'}
          >
            <span className="text-sm leading-none">{emoji}</span>
            <span className="tabular-nums text-slate-600">{info.count}</span>
          </button>
        ))}
    </div>
  );
};
