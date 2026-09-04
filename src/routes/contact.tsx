import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Building2, Zap, Loader2, ArrowRight, ShieldAlert, Headphones } from "lucide-react";
import newBg from "@/assets/new bg.png";
import { Navbar, Footer } from "./index";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid work email"),
  company: z.string().min(1, "Company name is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Sales & Technical Support — Todellaa" },
      { name: "description", content: "Reach out to Todellaa integration specialists for high-integrity payment verification and reconciliation." }
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    toast.success("Inquiry received! Our matching team will respond within 15 minutes.");
    reset();
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden antialiased relative">
      {/* Background Dot Grid Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mix-blend-multiply" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem]" />
      
      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute top-0 left-[10%] w-[50rem] h-[35rem] rounded-full bg-indigo-950/[0.01] blur-[140px] pointer-events-none z-0 animate-float" />

      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          
          {/* Header section with load animation */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-3.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-[0.2em] text-[#0a1b33] mb-5 font-bold shadow-sm">
              // SECURE CHANNELS
            </div>
            <h1 className="text-4xl font-display font-medium tracking-tight text-[#0a1b33] sm:text-6xl">
              Connect with ledger specialists.
            </h1>
            <p className="mt-5 text-slate-500 max-w-2xl mx-auto font-sans font-light leading-relaxed">
              Have complex bank API integrations, multi-tenant compliance queries, or custom CSV layouts? Reach out and get verified answers immediately.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-5 items-start">
            
            {/* Left Column: Contact Cards */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Executive Contact Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0a1b33] shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#0a1b33]">Dr Noskim Atidigah</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">// ACCRA, GHANA</p>
                    <a href="mailto:noskim.atidigah@gmail.com" className="text-xs text-[#0a1b33] hover:underline block mt-2 font-medium font-sans">
                      noskim.atidigah@gmail.com
                    </a>
                    <a href="mailto:noskim@bulaiza.com" className="text-xs text-[#0a1b33] hover:underline block mt-1 font-medium font-sans">
                      noskim@bulaiza.com
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Phone & WhatsApp Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">Mobile &amp; WhatsApp</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">// DIRECT CALLS &amp; CHAT</p>
                    <a href="tel:+233264445383" className="text-xs text-emerald-600 hover:underline block mt-2 font-medium font-sans">
                      Mobile: +233-26 444 53 83
                    </a>
                    <a href="https://wa.me/233508069168" target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline block mt-1 font-medium font-sans">
                      WhatsApp: +233-50 806 9168
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Skype Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#e8562a]/10 border border-[#e8562a]/20 flex items-center justify-center text-[#e8562a] shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-slate-900">Skype Communications</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">// INSTANT MESSENGER</p>
                    <span className="text-xs text-[#e8562a] block mt-2 font-semibold font-sans">
                      Skype: noskim1
                    </span>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Contact Form Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="md:col-span-3 rounded-[32px] border border-slate-200/60 bg-white p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-450 pl-1 font-mono">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Leon Chike"
                      className="w-full rounded-full px-5 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a152d]/10 focus:border-[#0a152d] bg-white text-slate-900 transition-all text-sm font-sans"
                      {...register("name")}
                    />
                    {errors.name && <p className="text-xs text-rose-500 pl-1 font-sans">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-slate-450 pl-1 font-mono">Company Name</label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Acme Ledger Inc."
                      className="w-full rounded-full px-5 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a152d]/10 focus:border-[#0a152d] bg-white text-slate-900 transition-all text-sm font-sans"
                      {...register("company")}
                    />
                    {errors.company && <p className="text-xs text-rose-500 pl-1 font-sans">{errors.company.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-450 pl-1 font-mono">Work Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="leon@acme.com"
                    className="w-full rounded-full px-5 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a152d]/10 focus:border-[#0a152d] bg-white text-slate-900 transition-all text-sm font-sans"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-xs text-rose-500 pl-1 font-sans">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-450 pl-1 font-mono">Message / Project Scope</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Describe your multi-tenant volume and target API adapters..."
                    className="w-full rounded-3xl px-5 py-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a152d]/10 focus:border-[#0a152d] bg-white text-slate-900 transition-all text-sm font-sans resize-none"
                    {...register("message")}
                  />
                  {errors.message && <p className="text-xs text-rose-500 pl-1 font-sans">{errors.message.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full py-6 font-sans text-xs font-semibold tracking-wider bg-[#0a152d] hover:bg-[#0a152d]/90 text-white rounded-full shadow-sm flex items-center justify-center gap-2 group transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      TRANSMIT INQUIRY
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

