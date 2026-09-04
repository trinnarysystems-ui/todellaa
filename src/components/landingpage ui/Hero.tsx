import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CreditCard,
  Building2,
  Smartphone
} from "lucide-react";

interface HeroProps {
  onOpenTrialModal?: () => void;
}

export default function Hero({ onOpenTrialModal }: HeroProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as const;

  return (
    <section className="relative pt-32 sm:pt-36 pb-20 sm:pb-28 bg-white text-[#010101] overflow-hidden font-sans">
      
      {/* Background Decorative Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e6e4dc_1px,transparent_1px),linear-gradient(to_bottom,#e6e4dc_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-200 h-87.5 bg-linear-to-tr from-blue-500/10 via-neutral-100/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Hero Copy & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#fcdcc5] bg-[#fff8f5] shadow-xs select-none mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-[#e8562a]" />
              <span className="text-xs sm:text-sm font-bold text-[#7c2d12]">
                Limited Early Access — TODELLAA User Trial
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] tracking-[-0.035em] text-[#010101] leading-[1.08] mb-6"
            >
              Try TODELLAA <br />
              Free for 2 Months. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#e8562a] via-[#f06e42] to-[#e8562a]">
                Zero Risk.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-[#525252] text-base sm:text-lg leading-[1.65] max-w-xl mb-6 font-normal"
            >
              Manage your invoices, payments and outstanding balances more easily with TODELLAA. We're offering <strong>two months of free access to our first 15 selected institutions</strong>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8"
            >
              <button
                onClick={onOpenTrialModal}
                className="bg-[#e8562a] hover:bg-[#d44820] text-white font-bold text-base py-3.5 px-7 rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                Start Your Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#pricing"
                className="bg-white hover:bg-neutral-50 text-[#171717] font-bold text-base py-3.5 px-7 rounded-xl border border-[#d4d4d4] transition-all shadow-xs text-center cursor-pointer"
              >
                View Plans & Pricing
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[#525252] text-xs sm:text-sm font-semibold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a]" />
                <span>No payment required during trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a]" />
                <span>Plans from GHS 100/mo after trial</span>
              </div>
            </motion.div>

            {/* Floating Live Activity Ticker Chip */}
            <motion.div
              variants={itemVariants}
              className="mt-8 bg-white/90 border border-[#e6e4dc] rounded-2xl p-3.5 shadow-sm flex items-center gap-3 w-full max-w-md"
            >
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#010101]">Automated Payment Matching</p>
                <span className="text-[#737373]">Paystack, MoMo & Bank Statement Sync</span>
              </div>
            </motion.div>

          </motion.div>

          {/* RIGHT COLUMN: Interactive Live Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 w-full relative"
          >
            {/* Background Subtle Glow Behind Card */}
            <div className="absolute -inset-2 bg-linear-to-r from-blue-500/10 via-neutral-100/30 to-transparent blur-xl rounded-3xl" />

            <div className="bg-white rounded-2xl border border-[#e6e4dc] shadow-2xl p-4 sm:p-5 relative overflow-hidden font-sans">
              
              {/* Top Navigation / Header Bar */}
              <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block" />
                  </div>
                  <h3 className="font-bold text-sm text-[#010101] ml-2 flex items-center gap-2">
                    Dashboard <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#737373]">
                  <span className="bg-[#f5f4ef] border border-[#e6e4dc] px-2.5 py-1 rounded-md font-semibold text-[#404040]">
                    May 1 - May 31, 2025
                  </span>
                  <div className="relative">
                    <Bell className="w-4 h-4 text-[#737373]" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#e8562a]" />
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="User Profile"
                    className="w-6.5 h-6.5 rounded-full object-cover border border-[#e6e4dc]"
                  />
                </div>
              </div>

              {/* Grid 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {/* Metric 1 */}
                <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4] hover:border-[#e8562a]/40 transition-colors">
                  <p className="text-[11px] font-medium text-[#737373]">Total Invoices</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base sm:text-lg font-bold text-[#010101]">1,248</span>
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> +10.5%
                    </span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4] hover:border-[#e8562a]/40 transition-colors">
                  <p className="text-[11px] font-medium text-[#737373]">Total Collected</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base sm:text-lg font-bold text-[#010101]">GHS 328,540</span>
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> +12.2%
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4] hover:border-[#e8562a]/40 transition-colors">
                  <p className="text-[11px] font-medium text-[#737373]">Outstanding</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base sm:text-lg font-bold text-[#010101]">GHS 146,320</span>
                    <span className="text-[10px] font-bold text-[#dc2626] bg-[#fee2e2] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" /> -5.1%
                    </span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4] hover:border-[#e8562a]/40 transition-colors">
                  <p className="text-[11px] font-medium text-[#737373]">Reconciled</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base sm:text-lg font-bold text-[#010101]">1,102</span>
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded">
                      88.3%
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Charts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                
                {/* Line & Bar Chart */}
                <div className="md:col-span-7 bg-[#faf9f6] p-3.5 rounded-xl border border-[#ecebe4]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#010101]">Collections Overview</span>
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-[#737373]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Collected
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#e8562a]" /> Outstanding
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart Graphics */}
                  <div className="h-28 w-full relative flex items-end justify-between pt-4 px-1">
                    {/* SVG Line path */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                      <path
                        d="M 10 70 Q 60 30, 110 50 T 210 20 T 310 40"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                      />
                      <circle cx="110" cy="50" r="3.5" fill="#16a34a" />
                      <circle cx="210" cy="20" r="3.5" fill="#16a34a" />
                    </svg>

                    {/* Bars */}
                    {[
                      { height: "45%", out: "65%" },
                      { height: "70%", out: "35%" },
                      { height: "60%", out: "80%" },
                      { height: "85%", out: "40%" },
                      { height: "75%", out: "50%" },
                    ].map((bar, i) => (
                      <div key={i} className="flex gap-1 items-end z-10">
                        <div className="w-2.5 bg-[#16a34a]/80 rounded-t-xs" style={{ height: bar.height }} />
                        <div className="w-2.5 bg-[#e8562a]/80 rounded-t-xs" style={{ height: bar.out }} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[9px] font-semibold text-[#a3a3a3] mt-2 border-t border-[#ecebe4] pt-1">
                    <span>May 1</span>
                    <span>May 8</span>
                    <span>May 15</span>
                    <span>May 21</span>
                    <span>May 31</span>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="md:col-span-5 bg-[#faf9f6] p-3.5 rounded-xl border border-[#ecebe4] flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#010101]">Payment Sources</span>
                  
                  <div className="flex items-center justify-center relative my-2">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="30" stroke="#3b82f6" strokeWidth="10" fill="transparent" strokeDasharray="188" strokeDashoffset="90" />
                      <circle cx="40" cy="40" r="30" stroke="#f59e0b" strokeWidth="10" fill="transparent" strokeDasharray="188" strokeDashoffset="140" />
                      <circle cx="40" cy="40" r="30" stroke="#e8562a" strokeWidth="10" fill="transparent" strokeDasharray="188" strokeDashoffset="170" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[10px] font-extrabold text-[#010101] block">GHS 328.5k</span>
                      <span className="text-[8px] font-medium text-[#737373] block">Total</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-[#525252]">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Paystack</span>
                      <span className="font-bold text-[#010101]">52%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Bank Transfer</span>
                      <span className="font-bold text-[#010101]">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e8562a]" /> Mobile Money</span>
                      <span className="font-bold text-[#010101]">13%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Section: Recent Activity & AI Assistant Widget */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Recent Activity List */}
                <div className="md:col-span-7 bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4]">
                  <span className="text-xs font-bold text-[#010101] mb-2 block">Recent Activity</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-[#f0eee6]">
                      <div>
                        <p className="font-semibold text-[#010101]">Payment GHS 750 matched to Invoice #INV-1024</p>
                        <span className="text-[9px] text-[#a3a3a3]">2m ago</span>
                      </div>
                      <span className="bg-[#eff6ff] text-[#2563eb] text-[9px] font-bold px-2 py-0.5 rounded">Paystack</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-[#f0eee6]">
                      <div>
                        <p className="font-semibold text-[#010101]">Bank transfer GHS 2,100 matched to Invoice #INV-1021</p>
                        <span className="text-[9px] text-[#a3a3a3]">15m ago</span>
                      </div>
                      <span className="bg-[#fef3c7] text-[#d97706] text-[9px] font-bold px-2 py-0.5 rounded">GCB Bank</span>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Floating Prompt Widget */}
                <div className="md:col-span-5 bg-[#faf9f6] p-3 rounded-xl border border-[#ecebe4] flex flex-col justify-between">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#010101] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#010101]">Smart Reconciliation Assistant</h5>
                      <p className="text-[10px] text-[#737373] mt-1 leading-snug font-medium">
                        12 potential matches found. Review and confirm matches to improve accuracy.
                      </p>
                    </div>
                  </div>
                  <button className="mt-3 bg-[#e8562a] hover:bg-[#d44820] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer">
                    Review Matches <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
