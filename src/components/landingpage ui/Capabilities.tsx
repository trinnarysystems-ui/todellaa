import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  CreditCard,
  Sparkles,
  BarChart3,
  RotateCcw,
  Bot,
  ShieldCheck,
  Building2,
  FileCheck,
  CheckCircle2,
  Zap,
  Lock,
  ArrowUpRight
} from "lucide-react";

export default function Capabilities() {
  const features = [
    {
      icon: Users,
      title: "Manage Customers",
      desc: "Store customer details, contacts, groups and payment history in a unified CRM view.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2.5 space-y-2 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#f0eee6]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">JD</div>
              <span className="font-bold text-[#010101] text-[11px]">John Doe</span>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">SME</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#737373] px-1">
            <span>3 Active Invoices</span>
            <span className="font-bold text-[#16a34a]">GHS 4,500 Paid</span>
          </div>
        </div>
      ),
    },
    {
      icon: FileText,
      title: "Create Invoices",
      desc: "Generate professional PDF & online invoices with instant payment links in seconds.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2.5 space-y-1.5 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#f0eee6]">
            <div>
              <span className="font-bold text-[#010101] text-[11px] block">#INV-2041</span>
              <span className="text-[9px] text-[#737373]">Due May 30</span>
            </div>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> PAID
            </span>
          </div>
        </div>
      ),
    },
    {
      icon: CreditCard,
      title: "Record & Verify Payments",
      desc: "Record payments made by your customers and confirm them against their invoices.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2.5 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="bg-white border border-[#f0eee6] px-2 py-1 rounded text-[10px] font-bold text-[#010101]">Paystack</span>
            <span className="bg-white border border-[#f0eee6] px-2 py-1 rounded text-[10px] font-bold text-[#010101]">MoMo</span>
            <span className="bg-white border border-[#f0eee6] px-2 py-1 rounded text-[10px] font-bold text-[#010101]">Bank</span>
          </div>
        </div>
      ),
    },
    {
      icon: Sparkles,
      title: "Automated Payment Matching",
      desc: "Automatically match payment information against invoices and customer records.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2.5 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#010101] mb-1">
            <span>Match Engine</span>
            <span className="text-[#16a34a]">Automated</span>
          </div>
          <div className="w-full h-2 bg-[#e6e4dc] rounded-full overflow-hidden">
            <div className="h-full bg-[#16a34a] w-full" />
          </div>
        </div>
      ),
    },
    {
      icon: BarChart3,
      title: "Track Balances",
      desc: "Monitor outstanding balances and overdue invoices in real-time operational views.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2.5 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#737373]">Outstanding</span>
            <span className="font-bold text-[#16a34a]">Live Tracking</span>
          </div>
          <div className="flex items-end gap-1 h-6 mt-1">
            <div className="w-full bg-slate-500/30 h-[80%] rounded-t-xs" />
            <div className="w-full bg-slate-500/60 h-[60%] rounded-t-xs" />
            <div className="w-full bg-slate-500 h-[40%] rounded-t-xs" />
          </div>
        </div>
      ),
    },
    {
      icon: RotateCcw,
      title: "Refunds & Adjustments",
      desc: "Process refunds and fee adjustments easily with full approval auditing.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2 mt-4 font-sans text-xs">
          <div className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-[#f0eee6]">
            <span className="text-[#737373]">REF-8841</span>
            <span className="bg-[#eff6ff] text-[#2563eb] font-bold px-1.5 py-0.5 rounded text-[9px]">Approved</span>
          </div>
        </div>
      ),
    },
    {
      icon: Bot,
      title: "Smart Insights & Reports",
      desc: "Get smart insights, payment trends, and automated financial summaries.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2 mt-4 font-sans text-[10px] text-[#010101]">
          <span className="font-bold block text-[#010101]">💡 Smart Tip:</span>
          <span className="text-[#737373]">85% of MoMo payments cleared on Fridays.</span>
        </div>
      ),
    },
    {
      icon: ShieldCheck,
      title: "Reliable Cloud Infrastructure",
      desc: "TODELLAA is built on reliable cloud infrastructure designed for high availability. We target 99.9% uptime to help keep your payment tracking running smoothly.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2 mt-4 font-sans text-xs flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#010101] flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#16a34a]" /> High Availability
          </span>
          <span className="bg-[#dcfce7] text-[#16a34a] text-[9px] font-bold px-1.5 py-0.5 rounded">99.9% Target</span>
        </div>
      ),
    },
    {
      icon: Building2,
      title: "Multi-Branch Support",
      desc: "Manage multiple branches, campuses, or regional divisions in one platform.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2 mt-4 font-sans text-[10px] flex items-center justify-between">
          <span className="bg-white border border-[#f0eee6] px-1.5 py-0.5 rounded font-bold text-[#010101]">Accra</span>
          <span className="bg-white border border-[#f0eee6] px-1.5 py-0.5 rounded font-bold text-[#010101]">Kumasi</span>
          <span className="bg-white border border-[#f0eee6] px-1.5 py-0.5 rounded font-bold text-[#010101]">Takoradi</span>
        </div>
      ),
    },
    {
      icon: FileCheck,
      title: "Audit Logs",
      desc: "Track every payment modification and user action with immutable audit trails.",
      widget: (
        <div className="bg-slate-50 border border-[#ecebe4] rounded-xl p-2 mt-4 font-sans text-[9px] text-[#737373]">
          <span className="font-mono font-bold text-[#010101] block">LOG #4082</span>
          <span>Matched #INV-1024 by System</span>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-white text-[#010101] font-sans border-t border-[#e6e4dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#e6e4dc] bg-white select-none mb-4">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#404040]">Platform Capabilities</span>
          </div>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-[44px] tracking-tight text-[#010101] leading-tight mb-4">
            Everything you need to manage payments
          </h2>
          <p className="text-[#525252] text-base sm:text-lg font-normal">
            From invoices to reconciliation, TODELLAA brings it all together.
          </p>
        </div>

        {/* 10 Feature Cards Grid (5 cols on lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white border border-[#e6e4dc] rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e6e4dc] text-[#010101] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#010101] tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#737373] leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Render Custom Mini-UI Widget */}
                {item.widget}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
