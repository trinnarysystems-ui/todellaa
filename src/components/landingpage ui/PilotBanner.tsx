import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface PilotBannerProps {
  onOpenTrialModal: () => void;
}

export default function PilotBanner({ onOpenTrialModal }: PilotBannerProps) {
  return (
    <div className="bg-linear-to-r from-[#171717] via-[#262626] to-[#171717] text-white py-2.5 px-4 text-xs font-sans border-b border-neutral-800 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto">
          <span className="bg-[#e8562a] text-white font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide inline-flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 fill-current" /> Limited Early Access
          </span>
          <span className="font-semibold text-neutral-200">
            Try TODELLAA Free for 2 Months
          </span>
          <span className="hidden md:inline text-neutral-400">• No payment required to start</span>
          <span className="hidden lg:inline text-neutral-400">• Plans from GHS 100/month after trial</span>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-center">
          <button
            onClick={onOpenTrialModal}
            className="bg-[#e8562a] hover:bg-[#d44820] text-white font-bold text-[11px] py-1 px-3.5 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            Start Your Free Trial <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
