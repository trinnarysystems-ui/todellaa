import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";

const faqData = [
  {
    q: "How does TODELLAA match bank transfers with invoices?",
    a: "TODELLAA uses a smart fuzzy matching engine that checks incoming transaction references, sender names, bank deposit amounts, and timestamp windows against outstanding invoices. It automatically verifies exact and high-confidence matches while flagging edge cases for quick one-click human review.",
  },
  {
    q: "Which payment gateways and banks are supported out of the box?",
    a: "TODELLAA natively integrates with Paystack, commercial bank API statement feeds, direct bank transfer notifications, and mobile money providers. We also support automated CSV statement uploads for legacy banks.",
  },
  {
    q: "Can TODELLAA handle partial payments or overpayments?",
    a: "Yes. TODELLAA's rules engine automatically categorizes underpayments or overpayments, generates split-settlement logs, and updates the customer invoice status with remaining balances.",
  },
  {
    q: "How secure is our financial data?",
    a: "TODELLAA uses SOC 2 Type II compliant infrastructure, end-to-end AES-256 encryption for stored credentials, and TLS 1.3 for all live payment webhooks. All audit actions are hash-chained to ensure 100% data integrity.",
  },
  {
    q: "How long does integration take?",
    a: "Most organizations go live in 1 to 4 weeks. Linking Paystack and bank statement feeds takes under 24 hours, followed by rule tuning and live webhook activation.",
  },
  {
    q: "Can we export audit logs for external accounting software?",
    a: "Yes. You can export complete, audit-ready reconciliation logs in CSV, JSON, or direct API format to Quickbooks, SAP, Sage, or custom ERP systems.",
  },
];

function FAQAccordionItem({
  q,
  a,
  isOpen,
  onClick,
  index,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`bg-white/80 border rounded-2xl p-6 transition-all shadow-2xs ${
        isOpen ? "border-[#e8562a] bg-white ring-1 ring-[#e8562a]/20 shadow-sm" : "border-neutral-200/80 hover:border-neutral-300 hover:bg-white"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left text-[#0a0a0a] focus:outline-none font-sans"
      >
        <span className="text-base sm:text-lg font-bold tracking-tight pr-4 font-sans">{q}</span>
        <span
          className={`shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
            isOpen
              ? "bg-[#e8562a] border-[#e8562a] text-white"
              : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 14 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-normal pr-4 border-t border-neutral-100 pt-4 font-sans">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const toggleIndex = (index: number) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <section id="faq" className="relative py-20 sm:py-28 border-t border-neutral-300/80 shadow-[inset_0_20px_35px_-15px_rgba(0,0,0,0.03)] bg-white z-10 scroll-mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
          
          {/* Left Column - STICKY Header */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300/80 bg-white/70 backdrop-blur-xs text-xs font-normal text-neutral-800 shadow-2xs select-none">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-800" />
              <span>Common Questions</span>
            </div>

            <h2 className="font-sans font-bold text-3xl sm:text-5xl lg:text-[52px] tracking-[-0.035em] text-[#0a0a0a] leading-[1.08]">
              <span className="block">Everything You</span>
              <span className="block">Need To Know.</span>
            </h2>

            <p className="text-neutral-500 text-base sm:text-lg leading-[1.6] font-normal">
              Got questions about deployment, data security, or statutory rules compliance? We've compiled detailed answers below.
            </p>

            <div className="pt-4">
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
                <span className="text-sm font-bold text-[#0a0a0a] block tracking-tight">
                  Need a custom solution?
                </span>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal">
                  Every business operates differently. If you have unique payment workflows or reconciliation requirements, our team can help tailor Todellaa to suit your organisation.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a0a0a] hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors mt-2"
                >
                  <span>Contact Our Team</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - SCROLLABLE Questions */}
          <div className="lg:col-span-7 space-y-4">
            {faqData.map((item, index) => (
              <FAQAccordionItem
                key={index}
                index={index}
                q={item.q}
                a={item.a}
                isOpen={openIndexes.includes(index)}
                onClick={() => toggleIndex(index)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
