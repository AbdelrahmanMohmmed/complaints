// src/components/IntegrationGuideModal.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, ChevronRight, ChevronLeft, Clock, AlertCircle, CheckCircle2, Copy, X } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { IntegrationGuide } from '../config/integrationGuides';

interface IntegrationGuideModalProps {
  guide: IntegrationGuide | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationGuideModal({ guide, isOpen, onClose }: IntegrationGuideModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // ─── RESET STEP WHEN GUIDE CHANGES ─────────────────────────────
  useEffect(() => {
    if (isOpen && guide) {
      setCurrentStep(0);
    }
  }, [guide?.channel, isOpen]);

  // ─── RESET WHEN CLOSED ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCopiedCode(false);
    }
  }, [isOpen]);

  if (!guide) return null;

  const step = guide.steps[currentStep];

  // Safety check — if step doesn't exist, reset to 0
  if (!step) {
    setCurrentStep(0);
    return null;
  }

  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn('text-xs', difficultyColors[guide.difficulty])}>
                  {guide.difficulty === 'easy' ? (isAr ? 'سهل' : 'Easy') :
                   guide.difficulty === 'medium' ? (isAr ? 'متوسط' : 'Medium') :
                   (isAr ? 'صعب' : 'Hard')}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {guide.estimatedTime}
                </div>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {guide.title}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {guide.description}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{isAr ? 'التقدم' : 'Progress'}</span>
              <span>{currentStep + 1} / {guide.steps.length}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          {/* Step Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentStep + 1}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
          </div>

          {/* Screenshot / Image */}
          {step.image && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-auto relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {step.description}
          </p>

          {/* Code Snippet */}
          {step.code && (
            <div className="relative">
              <div className="bg-gray-900 rounded-xl p-4 pr-12 overflow-x-auto">
                <code className="text-sm text-green-400 font-mono break-all">
                  {step.code}
                </code>
              </div>
              <button
                onClick={() => handleCopyCode(step.code!)}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedCode ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>{isAr ? 'نصيحة:' : 'Tip:'}</strong> {step.tip}
              </p>
            </div>
          )}

          {/* Requirements (only on first step) */}
          {currentStep === 0 && guide.requirements.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                {isAr ? 'المتطلبات:' : 'Requirements:'}
              </h4>
              <ul className="space-y-1.5">
                {guide.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className={cn("w-4 h-4", isAr && "rotate-180")} />
            {isAr ? 'السابق' : 'Previous'}
          </Button>

          <div className="flex gap-1">
            {guide.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                )}
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (currentStep < guide.steps.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                onClose();
              }
            }}
            className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {currentStep === guide.steps.length - 1
              ? (isAr ? 'إنهاء' : 'Finish')
              : (isAr ? 'التالي' : 'Next')
            }
            <ChevronRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}