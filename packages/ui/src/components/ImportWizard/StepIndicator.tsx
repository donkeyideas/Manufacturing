import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    isCompleted && 'bg-emerald-600 text-white',
                    isActive && 'bg-blue-600 text-white',
                    isPending && 'bg-surface-2 text-text-muted'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>

                {/* Step label */}
                <div
                  className={cn(
                    'mt-2 text-sm font-medium text-center',
                    isActive && 'text-text-primary',
                    !isActive && 'text-text-muted'
                  )}
                >
                  {step}
                </div>
              </div>

              {/* Connector line (not shown after last step) */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 mt-[-24px]">
                  <div
                    className={cn(
                      'h-0.5 transition-colors',
                      isCompleted ? 'bg-emerald-600' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
