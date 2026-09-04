import React from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface PilotBannerProps {
  onOpenTrialModal: () => void;
  onClose?: () => void;
}

export default function PilotBanner({ onOpenTrialModal, onClose }: PilotBannerProps) {
  return (
    <div className="bg-linear-to-r from-[#e8562a] via-[#ef6438] to-[#ea580c] text-white py-2 px-4 text-xs font-sans shadow-xs relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 flex-1 min-w-0">
          <span className="bg-white/20 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide inline-flex items-center gap-1 shrink-0 backdrop-blur-xs">
            <Sparkles className="w-3 h-3 fill-current" /> Limited Early Access
          </span>
          <span className="font-bold text-white truncate">
            Try TODELLAA Free for 2 Months
          </span>
          <span className="hidden md:inline text-orange-100 text-[11px]">• No payment required to start</span>
          <span className="hidden lg:inline text-orange-100 text-[11px]">• Plans from GHS 100/month after trial</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTrialModal}
            className="bg-white hover:bg-orange-50 text-[#e8562a] font-bold text-[11px] py-1 px-3 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            Start Your Free Trial <ArrowRight className="w-3 h-3" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-orange-100 hover:text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
              aria-label="Close Announcement Banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
