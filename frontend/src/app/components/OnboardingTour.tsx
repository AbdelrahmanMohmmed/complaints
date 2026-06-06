// src/components/OnboardingTour.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface TourStep {
  target: string;          // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string;          // Navigate to this route before showing step
  action?: () => void;     // Optional action before showing step
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

export function OnboardingTour({ steps, onComplete, onSkip, isOpen }: OnboardingTourProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isAr = language === 'ar';

  const currentStepData = steps[currentStep];

  const updateHighlight = useCallback(() => {
    if (!currentStepData) return;

    // Small delay to allow route transitions / renders
    setTimeout(() => {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        // Scroll element into view smoothly
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightRect(null);
      }
    }, 300);
  }, [currentStepData]);

  // Navigate to route if needed, then update highlight
  useEffect(() => {
    if (!isOpen) return;

    const runStep = async () => {
      setIsTransitioning(true);

      if (currentStepData?.route) {
        navigate(currentStepData.route);
      }

      if (currentStepData?.action) {
        await currentStepData.action();
      }

      updateHighlight();
      setIsTransitioning(false);
    };

    runStep();
  }, [currentStep, isOpen, currentStepData, navigate, updateHighlight]);

  // Update on window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => updateHighlight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, updateHighlight]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!highlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const position = currentStepData?.position || 'bottom';

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = highlightRect.bottom + padding;
        left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = highlightRect.top - tooltipHeight - padding;
        left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        top = highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2;
        left = highlightRect.right + padding;
        break;
      case 'left':
        top = highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2;
        left = highlightRect.left - tooltipWidth - padding;
        break;
    }

    // Keep within viewport
    const maxLeft = window.innerWidth - tooltipWidth - 20;
    const maxTop = window.innerHeight - tooltipHeight - 20;
    left = Math.max(20, Math.min(left, maxLeft));
    top = Math.max(20, Math.min(top, maxTop));

    return { top: `${top}px`, left: `${left}px`, transform: 'none' };
  };

  const tooltipPos = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999]" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="highlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#highlight-mask)"
          className="pointer-events-auto"
          onClick={onSkip}
        />
      </svg>

      {/* Highlight border */}
      {highlightRect && (
        <div
          className="absolute pointer-events-none border-2 border-blue-500 rounded-xl animate-pulse"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 w-[320px] transition-all duration-300",
          isTransitioning && "opacity-0 scale-95"
        )}
        style={tooltipPos}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? "bg-blue-500" : idx < currentStep ? "bg-blue-300" : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {currentStepData?.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
          {currentStepData?.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors",
              currentStep === 0
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <ChevronLeft className={cn("w-4 h-4", isAr && "rotate-180")} />
            {isAr ? 'السابق' : 'Previous'}
          </button>

          <span className="text-xs text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            {currentStep === steps.length - 1
              ? (isAr ? 'إنهاء' : 'Finish')
              : (isAr ? 'التالي' : 'Next')
            }
            <ChevronRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}