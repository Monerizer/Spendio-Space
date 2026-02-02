import React, { useState } from "react";
import { ChevronRight, Check } from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  action: string;
  icon: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Set Your Balances",
    description: "Tell us how much money you have in each account (cash, savings, investments, emergency fund)",
    action: "Go to Financial Data",
    icon: "💰",
  },
  {
    id: 2,
    title: "Add Your Monthly Income",
    description: "Record your regular income sources so we can calculate your financial health",
    action: "Add Income",
    icon: "💵",
  },
  {
    id: 3,
    title: "Track Your Expenses",
    description: "Log your spending habits to understand where your money goes",
    action: "Add Expenses",
    icon: "📊",
  },
  {
    id: 4,
    title: "Set Savings Goals",
    description: "Create targets for savings and investing to stay motivated",
    action: "Set Targets",
    icon: "🎯",
  },
];

interface OnboardingWizardProps {
  completedSteps: number[];
  onClose: () => void;
}

export function OnboardingWizard({ completedSteps, onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const progress = ((completedSteps.length / steps.length) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Get Started</h2>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#1a1a1a] transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#1a1a1a]">Setup Progress</span>
            <span className="text-[#1db584] font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1db584] to-[#0f8a56] transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center space-y-3">
          <div className="text-5xl">{step.icon}</div>
          <div>
            <h3 className="text-base font-bold text-[#1a1a1a] mb-1">{step.title}</h3>
            <p className="text-xs text-[#666666]">{step.description}</p>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                completedSteps.includes(index + 1)
                  ? "bg-[#1db584] w-8"
                  : index === currentStep
                  ? "bg-[#1db584] w-6"
                  : "bg-[#e5e5e5] w-2"
              }`}
            ></div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1 px-3 py-1.5 text-xs border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onClose();
              }
            }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
          >
            {currentStep === steps.length - 1 ? "Done" : "Next"}
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Completed Steps List */}
        <div className="border-t border-[#e5e5e5] pt-3">
          <p className="text-xs font-medium text-[#666666] mb-1.5">Completed Steps</p>
          <div className="space-y-0.5">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                {completedSteps.includes(s.id) ? (
                  <>
                    <Check size={14} className="text-[#1db584]" />
                    <span className="text-[#1a1a1a]">{s.title}</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full border-2 border-[#e5e5e5]"></div>
                    <span className="text-[#999999]">{s.title}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
