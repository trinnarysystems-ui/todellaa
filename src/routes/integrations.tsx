import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Network, ArrowRightLeft, ShieldCheck, CheckCircle2, Cpu, CreditCard } from "lucide-react";
import { Navbar, Footer } from "./index";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "System Integrations — Todellaa" },
      { name: "description", content: "Integrate Todellaa with Paystack, MTN Mobile Money, Telecel, GCB, Stanbic Bank, and standard SWIFT MT940 bank statements." }
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const channels = [
    { name: "Paystack API", type: "Gateway", status: "Available", delay: "Real-time Webhook" },
    { name: "MTN Mobile Money", type: "Mobile Wallet", status: "Supported", delay: "Instant Push" },
    { name: "Telecel Cash", type: "Mobile Wallet", status: "Supported", delay: "Instant Push" },
    { name: "AirtelTigo Money", type: "Mobile Wallet", status: "Supported", delay: "Instant Push" },
    { name: "Stanbic Bank statements", type: "SWIFT MT940", status: "Supported", delay: "Batch Parser" },
    { name: "GCB Bank statements", type: "SWIFT MT940", status: "Supported", delay: "Batch Parser" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden antialiased relative">
      {/* Background Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mix-blend-multiply" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem]" />

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-3.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-[0.2em] text-slate-800 mb-5 font-bold shadow-sm">
              // CONNECTIVITY ENGINE
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl font-sans">
              System Integrations
            </h1>
            <p className="mt-5 text-slate-500 max-w-xl mx-auto font-sans font-light leading-relaxed">
              Connect your transactional channels, payment processors, and bank statement pipelines to Todellaa's real-time verification suite.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm mb-4">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Gateways</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Plug in standard API integrations like Paystack to receive immediate webhook feeds for cards and mobile payments.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm mb-4">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Mobile Networks</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Direct compatibility with major telecom wallets (MTN MoMo, Telecel Cash, AirtelTigo Money) for domestic retail verification.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm mb-4">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">SWIFT & Bank Files</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Upload raw MT940 statements, GCB bank spreadsheets, and Stanbic reports directly to match high-volume transfers.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[32px] border border-slate-200/60 bg-white p-8 md:p-12 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight font-sans">
              Supported Channels Registry
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Channel Name</th>
                    <th className="py-3 px-2">Integration Method</th>
                    <th className="py-3 px-2">Reconcile Speed</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-slate-600 font-medium">
                  {channels.map((chan, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-2 font-bold text-slate-900">{chan.name}</td>
                      <td className="py-3.5 px-2 text-slate-500">{chan.type}</td>
                      <td className="py-3.5 px-2 text-slate-500">{chan.delay}</td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border border-emerald-500/10">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {chan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

