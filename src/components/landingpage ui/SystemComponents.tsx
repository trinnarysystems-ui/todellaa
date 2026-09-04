import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
  ShieldAlert,
  BarChart2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Bot
} from "lucide-react";

export default function SystemComponents() {
  return (
    <section id="integrations" className="py-20 sm:py-28 bg-white text-[#010101] font-sans border-t border-[#e6e4dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT BLOCK: CONNECT ALL YOUR PAYMENT SOURCES */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white/70 border border-[#e6e4dc] rounded-3xl p-6 sm:p-8 shadow-xs">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#737373] uppercase mb-6 block">
                CONNECT ALL YOUR PAYMENT SOURCES
              </span>

              {/* 3 Flow Cards connected by dotted arrows */}
              <div className="space-y-4 relative">
                
                {/* Source 1: Paystack */}
                <div className="bg-white border border-[#e6e4dc] rounded-2xl p-5 shadow-2xs hover:border-[#0ba4db] transition-colors relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0ba4db]/10 text-[#0ba4db] flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#010101]">Paystack</h4>
                      <span className="text-xs text-[#737373]">Online Cards & Payment Links</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#525252]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Real-time transaction sync
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Auto-match & verify payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Webhooks for updates
                    </li>
                  </ul>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center my-1 text-[#a3a3a3]">
                  <div className="h-4 border-r-2 border-dashed border-[#d4d4d4]" />
                </div>

                {/* Source 2: Bank Transfers */}
                <div className="bg-white border border-[#e6e4dc] rounded-2xl p-5 shadow-2xs hover:border-[#f59e0b] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 text-[#d97706] flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#010101]">Bank Transfers</h4>
                      <span className="text-xs text-[#737373]">Direct Wire & Account References</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#525252]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Import bank statements (CSV, MT940)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Auto-match references & accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Support for all major banks
                    </li>
                  </ul>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center my-1 text-[#a3a3a3]">
                  <div className="h-4 border-r-2 border-dashed border-[#d4d4d4]" />
                </div>

                {/* Source 3: Mobile Money */}
                <div className="bg-white border border-[#e6e4dc] rounded-2xl p-5 shadow-2xs hover:border-[#e8562a] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#e8562a]/10 text-[#e8562a] flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#010101]">Mobile Money</h4>
                      <span className="text-xs text-[#737373]">MTN MoMo, Telecel, AirtelTigo</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#525252]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> MTN MoMo, Telecel Cash, AirtelTigo Money
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" /> Instant payment reconciliation
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT BLOCK: SMART AUTOMATION SPOTLIGHT */}
          <div id="ai-tools" className="lg:col-span-6 bg-white/70 border border-[#e6e4dc] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-[#e8562a]" /> Smart Automation
              </div>

              <h3 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#010101] tracking-tight mb-3">
                Work smarter with automation
              </h3>

              <p className="text-sm text-[#525252] leading-relaxed mb-6">
                TODELLAA's smart engine helps you detect issues, suggest matches and deliver actionable insights.
              </p>

              {/* AI Capabilities List */}
              <div className="space-y-4 mb-8">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e8562a]/10 text-[#e8562a] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#010101]">Smart Reconciliation Assistant</h5>
                    <p className="text-xs text-[#737373]">Find potential matches and reduce manual work.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e8562a]/10 text-[#e8562a] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#010101]">Anomaly Detection</h5>
                    <p className="text-xs text-[#737373]">Detect unusual payments, duplicates and mismatches.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e8562a]/10 text-[#e8562a] flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#010101]">Smart Insights</h5>
                    <p className="text-xs text-[#737373]">Cash flow, trends, collection performance and more.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e8562a]/10 text-[#e8562a] flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#010101]">Financial Reports</h5>
                    <p className="text-xs text-[#737373]">Generate accurate reports in seconds.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Sub-card: Potential Matches (12) */}
            <div className="bg-slate-50/80 rounded-2xl border border-[#e6e4dc] p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#e6e4dc]/60 pb-2 mb-3">
                <span className="text-xs font-bold text-[#010101]">Potential Matches (12)</span>
                <span className="text-[10px] font-semibold text-[#404040] bg-white border border-[#e6e4dc] px-2 py-0.5 rounded">Live Suggestions</span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#e6e4dc]">
                  <div>
                    <p className="font-semibold text-[#010101]">Payment of GHS 1,500</p>
                    <span className="text-[10px] text-[#737373]">from John Doe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded">95%</span>
                    <button className="text-[11px] font-semibold text-[#010101] bg-white border border-[#d4d4d4] hover:bg-neutral-50 px-2.5 py-1 rounded">Review</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#e6e4dc]">
                  <div>
                    <p className="font-semibold text-[#010101]">Payment of GHS 2,000</p>
                    <span className="text-[10px] text-[#737373]">from Acme Ltd.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded">92%</span>
                    <button className="text-[11px] font-semibold text-[#010101] bg-white border border-[#d4d4d4] hover:bg-neutral-50 px-2.5 py-1 rounded">Review</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#e6e4dc]">
                  <div>
                    <p className="font-semibold text-[#010101]">Payment of GHS 750</p>
                    <span className="text-[10px] text-[#737373]">from Mary Quaye</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded">90%</span>
                    <button className="text-[11px] font-semibold text-[#010101] bg-white border border-[#d4d4d4] hover:bg-neutral-50 px-2.5 py-1 rounded">Review</button>
                  </div>
                </div>
              </div>

              <a href="#matches" className="text-xs font-semibold text-[#e8562a] hover:underline flex items-center justify-center gap-1 text-center">
                View all matches <ArrowRight className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
