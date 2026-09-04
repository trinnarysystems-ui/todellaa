import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface PricingProps {
  onOpenTrialModal?: () => void;
}

export default function Pricing({ onOpenTrialModal }: PricingProps) {
  const plans = [
    {
      name: "Basic",
      tagline: "For small teams & shops",
      price: "100",
      users: "2 Users",
      customers: "Up to 50 / month",
      isPopular: false,
      ctaText: "Start Free Trial",
      features: [
        "2 Team Users",
        "Up to 50 Customers / month",
        "Invoice & Payment Recording",
        "MoMo & Bank Verification",
        "Standard Financial Reports",
      ],
    },
    {
      name: "Standard",
      tagline: "For growing businesses",
      price: "150",
      users: "2 Users",
      customers: "Up to 100 / month",
      isPopular: true,
      popularTag: "Recommended",
      ctaText: "Start Free Trial",
      features: [
        "2 Team Users",
        "Up to 100 Customers / month",
        "Automated Payment Matching",
        "Outstanding Balance Tracking",
        "Priority Support",
      ],
    },
    {
      name: "Professional",
      tagline: "For expanding organizations",
      price: "250",
      users: "Up to 5 Users",
      customers: "Up to 300 / month",
      isPopular: false,
      ctaText: "Start Free Trial",
      features: [
        "Up to 5 Team Users",
        "Up to 300 Customers / month",
        "Multi-Branch Support",
        "Audit Trail Logging",
        "Custom Reports & Export",
      ],
    },
    {
      name: "Business",
      tagline: "For high-volume operations",
      price: "400",
      users: "Up to 10 Users",
      customers: "Up to 1,000 / month",
      isPopular: false,
      ctaText: "Start Free Trial",
      features: [
        "Up to 10 Team Users",
        "Up to 1,000 Customers / month",
        "Advanced Analytics & Insights",
        "Dedicated Onboarding",
        "Role-Based Permissions",
      ],
    },
    {
      name: "Enterprise",
      tagline: "For large institutions",
      price: "From 600",
      users: "10+ Users",
      customers: "Higher Volume",
      isPopular: false,
      ctaText: "Contact Sales",
      features: [
        "10+ Team Users",
        "Custom Volume Limits",
        "Tailored Statements & ERP Sync",
        "Dedicated Account Manager",
        "High Availability Cloud Tier",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white text-[#010101] font-sans border-t border-[#e6e4dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#e6e4dc] bg-white select-none mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#e8562a]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#404040]">Planned Packages</span>
          </div>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-[44px] tracking-tight text-[#010101] leading-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[#525252] text-base sm:text-lg font-normal">
            Try TODELLAA free for 2 months. After your trial, choose the plan appropriate for your organization.
          </p>

          <div className="mt-4 bg-[#faf9f5] border border-[#ecebe4] rounded-2xl p-3.5 inline-block text-xs font-medium text-[#737373]">
            💡 <strong>Note:</strong> Pricing shown is our current planned pricing and may be adjusted as we refine our plans.
          </div>
        </div>

        {/* Pricing Cards Grid (5 plans) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch max-w-7xl mx-auto">
          {plans.map((plan, idx) => {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? "bg-white border-2 border-[#e8562a] shadow-xl z-10"
                    : "bg-white border border-[#e6e4dc] shadow-xs hover:border-[#d4d4d4]"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 right-4 bg-[#e8562a] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" /> {plan.popularTag}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#010101] tracking-tight">{plan.name}</h3>
                  <p className="text-[11px] text-[#737373] mt-0.5 font-normal leading-snug">{plan.tagline}</p>

                  <div className="my-5">
                    <span className="text-xs font-bold text-[#737373]">GHS </span>
                    <span className="text-3xl font-extrabold text-[#010101] tracking-tight">{plan.price}</span>
                    <span className="text-xs font-medium text-[#737373]"> / month</span>
                  </div>

                  <div className="bg-[#faf9f5] border border-[#ecebe4] rounded-xl p-2 mb-4 text-[10px] font-semibold text-[#404040]">
                    <div>👥 {plan.users}</div>
                    <div className="mt-0.5">📊 {plan.customers}</div>
                  </div>

                  <div className="border-t border-[#f0eee6] pt-4 space-y-2 mb-6">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#404040]">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#fef3eb] text-[#e8562a] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                        <span className="font-medium text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={onOpenTrialModal}
                    className={`w-full text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-2xs block text-center cursor-pointer ${
                      plan.isPopular
                        ? "bg-[#e8562a] hover:bg-[#d44820] text-white"
                        : "bg-white hover:bg-neutral-50 text-[#010101] border border-[#d4d4d4]"
                    }`}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
