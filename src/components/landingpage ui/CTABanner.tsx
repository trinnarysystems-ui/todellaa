import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  onOpenTrialModal?: () => void;
}

export default function CTABanner({ onOpenTrialModal }: CTABannerProps) {
  return (
    <section className="py-16 sm:py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#121214] border border-neutral-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          {/* Background Decorative Curves */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 1200 400" fill="none" preserveAspectRatio="none">
              <path d="M0 200 Q 300 50, 600 200 T 1200 200" stroke="white" strokeWidth="40" />
              <path d="M0 300 Q 400 100, 800 300 T 1200 100" stroke="white" strokeWidth="20" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Device Mockups (Laptop & Phone) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md">
                {/* Laptop Mockup Box */}
                <div className="bg-neutral-900 border-4 border-neutral-800 rounded-xl p-2 shadow-2xl overflow-hidden">
                  <div className="bg-[#FAF9F5] rounded-lg p-2 text-neutral-900">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      <span className="text-[9px] font-bold text-neutral-600 ml-1">TODELLAA App</span>
                    </div>
                    <div className="space-y-1 text-[9px]">
                      <div className="bg-[#e8562a]/10 p-1.5 rounded font-bold text-[#e8562a]">Reconciliation Status: Verified</div>
                      <div className="bg-white p-1 rounded border border-neutral-200">INV-1042 · GHS 12,500 Matched</div>
                      <div className="bg-white p-1 rounded border border-neutral-200">INV-1043 · GHS 4,200 Matched</div>
                    </div>
                  </div>
                </div>

                {/* Floating Phone Mockup Box */}
                <div className="absolute -bottom-4 -right-4 w-32 sm:w-36 bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-1.5 shadow-2xl">
                  <div className="bg-white rounded-xl p-2 text-[8px] text-neutral-900 font-sans">
                    <span className="font-bold text-[#e8562a] block">MTN MoMo Sync</span>
                    <span className="text-neutral-500 block">GH₵ 750 Received</span>
                    <span className="bg-[#dcfce7] text-[#16a34a] font-bold px-1 rounded block text-center mt-1">Matched</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: CTA Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-4">
                Ready to simplify your payment records?
              </h2>

              <p className="text-white/90 text-base sm:text-lg max-w-xl font-normal leading-relaxed mb-8">
                Try TODELLAA free for 2 months and see how it fits your organisation.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={onOpenTrialModal}
                  className="w-full sm:w-auto bg-[#e8562a] hover:bg-[#d44820] text-white font-extrabold text-base py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Your Free Trial <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#pricing"
                  className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-bold text-base py-3.5 px-8 rounded-xl border border-white/40 transition-all text-center cursor-pointer"
                >
                  View Plans & Pricing
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
