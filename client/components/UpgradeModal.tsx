import React from "react";
import { X, Sparkles, TrendingUp, Zap } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  features?: string[];
  onUpgradeClick?: () => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title,
  description,
  features = [],
  onUpgradeClick,
}: UpgradeModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="presentation" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        aria-describedby="upgrade-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f3f3f3] rounded-lg transition"
            aria-label="Close upgrade modal"
          >
            <X size={20} className="text-[#666666]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-[#1db584] to-[#0f8a56] p-4 rounded-full">
              <Sparkles size={32} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 id="upgrade-modal-title" className="text-2xl font-bold text-[#1a1a1a] mb-2">{title}</h2>
            <p id="upgrade-modal-description" className="text-[#666666]">{description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 space-y-2 text-left" role="region" aria-label="Premium features">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#1db584] rounded-full flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-[#1a1a1a]">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2">
            <button
              onClick={onUpgradeClick || (() => window.location.href = "/billing")}
              className="w-full bg-gradient-to-r from-[#1db584] to-[#0f8a56] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              aria-label="Upgrade to Premium subscription"
            >
              <Zap size={18} aria-hidden="true" />
              Upgrade to Premium
            </button>
            <button
              onClick={onClose}
              className="w-full border border-[#e5e5e5] text-[#1a1a1a] font-semibold py-3 rounded-lg hover:bg-[#f9f9f9] transition"
              aria-label="Dismiss upgrade offer"
            >
              Maybe later
            </button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-[#999999]">
            7-day free trial included. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
