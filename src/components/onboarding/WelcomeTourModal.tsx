import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  MessageSquare,
  Layers,
  CheckCircle2,
  Copy,
  Bell,
  User,
  ArrowRight,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  isReplay?: boolean;
  onClose: () => void;
}

export const WelcomeTourModal: React.FC<Props> = ({ isOpen, isReplay = false, onClose }) => {
  const { t, completeTour } = useApp();
  const [phase, setPhase] = useState<'welcome' | 'tour'>(isReplay ? 'tour' : 'welcome');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isReplay) {
      setPhase('tour');
      setCurrentStep(0);
    } else {
      setPhase('welcome');
      setCurrentStep(0);
    }
  }, [isOpen, isReplay]);

  if (!isOpen) return null;

  const steps = [
    {
      title: t.tourStep1Title,
      desc: t.tourStep1Desc,
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      badge: 'Step 1'
    },
    {
      title: t.tourStep2Title,
      desc: t.tourStep2Desc,
      icon: <Layers className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      badge: 'Step 2'
    },
    {
      title: t.tourStep3Title,
      desc: t.tourStep3Desc,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      badge: 'Step 3'
    },
    {
      title: t.tourStep4Title,
      desc: t.tourStep4Desc,
      icon: <Copy className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      badge: 'Step 4'
    },
    {
      title: t.tourStep5Title,
      desc: t.tourStep5Desc,
      icon: <Bell className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      badge: 'Step 5'
    },
    {
      title: t.tourStep6Title,
      desc: t.tourStep6Desc,
      icon: <User className="w-6 h-6 text-sky-600" />,
      color: 'bg-sky-50 border-sky-200 text-sky-700',
      badge: 'Step 6'
    }
  ];

  const handleStartTour = () => {
    setPhase('tour');
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    completeTour();
    onClose();
  };

  const handleSkip = () => {
    completeTour();
    onClose();
  };

  // Phase 1: Welcome Popup
  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
        <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t.welcomeTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.welcomeDesc}
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleStartTour}
              className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.startTour}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full min-h-[40px] py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {t.skipForNow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Interactive 6-step Tour
  const activeStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5">
        {/* Top Header Row with Skip / Close */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t.close}
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Visual & Content */}
        <div className="text-center space-y-3 py-1">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-2xs ${activeStep.color}`}
          >
            {activeStep.icon}
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {activeStep.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            {activeStep.desc}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              currentStep === 0
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
            className="min-h-[40px] px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? t.finish : t.next}</span>
            {currentStep === steps.length - 1 ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
