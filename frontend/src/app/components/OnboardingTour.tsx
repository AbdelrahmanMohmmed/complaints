// src/components/OnboardingTour.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '../components/ui/utils';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  route?: string;
  action?: () => void;
  noScroll?: boolean;
  offset?: { x?: number; y?: number };
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

export function OnboardingTour({ steps, onComplete, onSkip, isOpen }: OnboardingTourProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isAr = language === 'ar';

  const currentStepData = steps[currentStep];

  const updateHighlight = useCallback(() => {
    if (!currentStepData) return;

    setTimeout(() => {
      const element = document.querySelector(currentStepData.target);
      if (!element) {
        setHighlightRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      if (!currentStepData.noScroll) {
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const isAbove = elementBottom < 0;
        const isBelow = elementTop > viewportHeight;

        if (isAbove) {
          window.scrollBy({ top: elementTop - 100, behavior: 'smooth' });
        } else if (isBelow) {
          window.scrollBy({ top: elementBottom - viewportHeight + 150, behavior: 'smooth' });
        }
      }
    }, 400);
  }, [currentStepData]);

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

  const getTooltipPosition = () => {
    if (!highlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const TOOLTIP_WIDTH = 340;
    const TOOLTIP_HEIGHT = 220;
    const GAP = 16;
    const offsetX = currentStepData?.offset?.x ?? 0;
    const offsetY = currentStepData?.offset?.y ?? 0;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceTop = highlightRect.top;
    const spaceBottom = vh - highlightRect.bottom;
    const spaceLeft = highlightRect.left;
    const spaceRight = vw - highlightRect.right;

    let position = currentStepData?.position || 'auto';

    if (position === 'top' && spaceTop < TOOLTIP_HEIGHT + GAP) {
      position = 'bottom';
    } else if (position === 'bottom' && spaceBottom < TOOLTIP_HEIGHT + GAP) {
      position = 'top';
    } else if (position === 'left' && spaceLeft < TOOLTIP_WIDTH + GAP) {
      position = 'right';
    } else if (position === 'right' && spaceRight < TOOLTIP_WIDTH + GAP) {
      position = 'left';
    }

    if (position === 'auto') {
      const spaces = [
        { pos: 'bottom', space: spaceBottom },
        { pos: 'top', space: spaceTop },
        { pos: 'right', space: spaceRight },
        { pos: 'left', space: spaceLeft },
      ];
      spaces.sort((a, b) => b.space - a.space);
      position = spaces[0].pos as 'top' | 'bottom' | 'left' | 'right';
    }

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = highlightRect.bottom + GAP;
        left = highlightRect.left + highlightRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'top':
        top = highlightRect.top - TOOLTIP_HEIGHT - GAP;
        left = highlightRect.left + highlightRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case 'right':
        top = highlightRect.top + highlightRect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = highlightRect.right + GAP;
        break;
      case 'left':
        top = highlightRect.top + highlightRect.height / 2 - TOOLTIP_HEIGHT / 2;
        left = highlightRect.left - TOOLTIP_WIDTH - GAP;
        break;
    }

    top += offsetY;
    left += offsetX;

    top = Math.max(10, Math.min(top, vh - TOOLTIP_HEIGHT - 10));
    left = Math.max(10, Math.min(left, vw - TOOLTIP_WIDTH - 10));

    return { top: `${top}px`, left: `${left}px`, transform: 'none' };
  };

  const tooltipPos = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-[9999]" dir={isAr ? 'rtl' : 'ltr'}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="highlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 6}
                y={highlightRect.top - 6}
                width={highlightRect.width + 12}
                height={highlightRect.height + 12}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#highlight-mask)"
          className="pointer-events-auto"
          onClick={onSkip}
        />
      </svg>

      {highlightRect && (
        <div
          className="absolute pointer-events-none border-2 border-blue-500 rounded-xl animate-pulse"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.08)',
          }}
        />
      )}

      <div
        className={cn(
          "absolute bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 w-[340px] transition-all duration-300",
          isTransitioning && "opacity-0 scale-95"
        )}
        style={tooltipPos}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep ? "w-6 bg-blue-500" : idx < currentStep ? "w-1.5 bg-blue-300" : "w-1.5 bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {currentStepData?.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
          {currentStepData?.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors",
              currentStep === 0 ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <ChevronLeft className={cn("w-4 h-4", isAr && "rotate-180")} />
            {isAr ? 'السابق' : 'Previous'}
          </button>

          <span className="text-xs text-gray-400 font-medium">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
          >
            {currentStep === steps.length - 1 ? (isAr ? 'إنهاء' : 'Finish') : (isAr ? 'التالي' : 'Next')}
            <ChevronRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}