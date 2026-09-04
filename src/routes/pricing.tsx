import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Navbar, Footer } from "./index";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Simple, Transparent Pricing Plans — Todellaa" },
      { name: "description", content: "Choose the pricing plan that fits your business or educational institution. Standard, Professional, and Custom Enterprise options available." }
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "GHS 100",
      users: "2 Users",
      customers: "Up to 50 / month",
      desc: "For small teams & shops starting out.",
      features: [
        "2 Team Users",
        "Up to 50 Customers / month",
        "Invoice & Payment Recording",
        "MoMo & Bank Verification",
        "Standard Financial Reports",
      ],
      popular: false,
    },
    {
      name: "Standard",
      price: "GHS 150",
      users: "2 Users",
      customers: "Up to 100 / month",
      desc: "For growing businesses needing automated reconciliation.",
      features: [
        "2 Team Users",
        "Up to 100 Customers / month",
        "Automated Payment Matching",
        "Outstanding Balance Tracking",
        "Priority Support",
      ],
      popular: true,
    },
    {
      name: "Professional",
      price: "GHS 250",
      users: "Up to 5 Users",
      customers: "Up to 300 / month",
      desc: "For expanding organizations managing multiple cashiers.",
      features: [
        "Up to 5 Team Users",
        "Up to 300 Customers / month",
        "Multi-Branch Support",
        "Audit Trail Logging",
        "Custom Reports & Export",
      ],
      popular: false,
    },
    {
      name: "Business",
      price: "GHS 400",
      users: "Up to 10 Users",
      customers: "Up to 1,000 / month",
      desc: "For high-volume retail & institutional operations.",
      features: [
        "Up to 10 Team Users",
        "Up to 1,000 Customers / month",
        "Advanced Analytics & Insights",
        "Dedicated Onboarding",
        "Role-Based Permissions",
      ],
      popular: false,
    },
    {
      name: "Enterprise",
      price: "From GHS 600",
      users: "10+ Users",
      customers: "Higher Volume",
      desc: "For large institutions with custom demands.",
      features: [
        "10+ Team Users",
        "Custom Volume Limits",
        "Tailored Statements & ERP Sync",
        "Dedicated Account Manager",
        "High Availability Cloud Infrastructure",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden antialiased relative">
      {/* Background Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mix-blend-multiply" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem]" />

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-3.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-[0.2em] text-slate-800 mb-5 font-bold shadow-sm">
              // ACCOUNT PLANS
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl font-sans">
              Planned Packages & Pricing
            </h1>
            <p className="mt-5 text-slate-500 max-w-xl mx-auto font-sans font-light leading-relaxed">
              Try TODELLAA free for 2 months. After your trial, choose the plan appropriate for your organization.
            </p>
            <div className="mt-4 bg-[#faf9f5] border border-[#ecebe4] rounded-2xl p-3.5 inline-block text-xs font-medium text-[#737373]">
              💡 <strong>Note:</strong> Pricing shown is our current planned pricing and may be adjusted as we refine our plans.
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16 items-stretch">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`rounded-[24px] border bg-white p-6 shadow-xs flex flex-col justify-between relative ${
                  plan.popular ? "border-[#e8562a] shadow-md z-10" : "border-slate-200/60"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8562a] text-white uppercase tracking-widest text-[9px] font-bold px-3 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 font-sans">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium">/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-light mb-4 leading-relaxed">{plan.desc}</p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 mb-4 text-[10px] font-semibold text-slate-700">
                    <div>👥 {plan.users}</div>
                    <div className="mt-0.5">📊 {plan.customers}</div>
                  </div>

                  <hr className="border-slate-100 mb-4" />

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2 items-start text-[11px] text-slate-650 font-medium leading-tight">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="/#pricing"
                  className={`w-full py-2.5 text-center rounded-xl font-semibold text-xs transition-all cursor-pointer block ${
                    plan.popular ? "bg-[#e8562a] text-white hover:bg-[#d44820]" : "bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  Start Free Trial
                </a>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

