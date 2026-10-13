import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useShellLayout } from '../../context/ShellLayoutContext';
import { WelcomeTourModal } from '../onboarding/WelcomeTourModal';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  MessageSquare,
  SendHorizontal,
  CheckCircle2,
  UserPlus,
  BarChart3,
  TrendingUp,
  Bell
} from 'lucide-react';

type FaqItem = {
  id: string;
  q: string;
  a: string;
  Icon: React.ElementType;
};

export const HelpView: React.FC = () => {
  const { currentUser, t, setActiveTab } = useApp();
  const { isExpandedShell } = useShellLayout();
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [replayTourOpen, setReplayTourOpen] = useState(false);
  const isAdmin = currentUser?.role === 'Admin';
  const isMarketer = currentUser?.role === 'Marketer';

  const faqs = useMemo<FaqItem[]>(() => {
    if (isAdmin) {
      return [
        {
          id: 'faq-1',
          q: 'How do I approve a new marketer?',
          a: 'Open Requests, review the profile (Info + Address), then tap Approve. The marketer can log in after approval. Rejected accounts stay blocked at login.',
          Icon: UserPlus
        },
        {
          id: 'faq-2',
          q: 'How do I send flyers to many marketers?',
          a: 'Use Bulk from the bottom nav (or the Bulk button on Conversations). Pick Flyer / Personalized / Normal, attach images if needed, select recipients, then send.',
          Icon: SendHorizontal
        },
        {
          id: 'faq-3',
          q: 'What does Analytics show?',
          a: 'Analytics summarizes creatives sent, post rate, pending vs not-posted, content mix, not-posted reasons, and a top-marketers leaderboard from live conversation data.',
          Icon: BarChart3
        },
        {
          id: 'faq-4',
          q: 'How do I track if content was posted?',
          a: 'Open a marketer conversation. Each creative card shows Posted, Not Posted, or Pending. Not Posted includes a reason when the marketer reports one.',
          Icon: CheckCircle2
        },
        {
          id: 'faq-5',
          q: 'What are Flyer, Personalized, and Normal?',
          a: 'Flyer and Personalized are postable creatives marketers must action. Normal is a regular chat message (with optional images) and is not tracked as a posting deliverable.',
          Icon: MessageSquare
        }
      ];
    }

    return [
      {
        id: 'faq-1',
        q: 'What should I do when I receive a flyer?',
        a: 'Open Conversations, review the creative, copy caption if needed, then mark Posted after you publish — or Not Posted with a reason if you cannot post yet.',
        Icon: CheckCircle2
      },
      {
        id: 'faq-2',
        q: 'Where do I see my posting history?',
        a: 'Open Stats (Performance) from the bottom nav or Profile. You’ll see post rate, streak, content mix, and a filterable history. Tap any item to jump to that message.',
        Icon: TrendingUp
      },
      {
        id: 'faq-3',
        q: 'How do preferred categories work?',
        a: 'Set one or more niches at Sign Up or in Edit Profile (Work Injury, Car Accident, Slip & Fall, Truck Accident, and more). Admins use these preferences when assigning content.',
        Icon: Sparkles
      },
      {
        id: 'faq-4',
        q: 'Why can’t I log in after signing up?',
        a: 'New marketers start as Pending. An admin must approve your request first. Rejected accounts stay blocked — contact your admin if you need a review.',
        Icon: Bell
      },
      {
        id: 'faq-5',
        q: 'Can I replay the welcome tour?',
        a: 'Yes. Tap Replay tour on this Help screen (or from Profile) anytime to walk through chats, creatives, posting actions, copy, notifications, and profile again.',
        Icon: HelpCircle
      }
    ];
  }, [isAdmin]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 overflow-y-auto">
      <div
        className={`w-full mx-auto p-3 space-y-3 pb-6 ${
          isExpandedShell ? 'max-w-3xl p-4 space-y-4' : 'max-w-md'
        }`}
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Help & FAQ
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Quick answers for {isAdmin ? 'admins' : 'marketers'}.
            {isMarketer ? ' Need a walkthrough? Replay the in-app tour below.' : ''}
          </p>

          {isMarketer && (
            <button
              type="button"
              onClick={() => setReplayTourOpen(true)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.replayTour}
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {faqs.map((item, idx) => {
            const open = openId === item.id;
            const Icon = item.Icon;
            return (
              <div
                key={item.id}
                className={idx > 0 ? 'border-t border-slate-100' : undefined}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block">{item.q}</span>
                    {open && (
                      <span className="text-[11px] text-slate-500 leading-relaxed mt-1.5 block">
                        {item.a}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Shortcuts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('conversations')}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Conversations
            </button>
            {isMarketer && (
              <button
                type="button"
                onClick={() => setActiveTab('performance')}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Performance
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Analytics
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {t.notifications}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {t.profile}
            </button>
          </div>
        </section>
      </div>

      <WelcomeTourModal
        isOpen={replayTourOpen}
        isReplay
        onClose={() => setReplayTourOpen(false)}
      />
    </div>
  );
};
