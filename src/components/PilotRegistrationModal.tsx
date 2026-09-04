import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PilotRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PilotRegistrationModal({ isOpen, onClose }: PilotRegistrationModalProps) {
  const [step, setStep] = useState<"intro" | "form" | "submitted">("intro");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    orgName: "",
    role: "Owner",
    phone: "",
    email: "",
    orgType: "School",
    orgTypeOther: "",
    customerCount: "1–50",
    paymentMethods: [] as string[],
    staffCount: "",
    recordingMethod: "Notebook/receipt book",
    whoChecks: "Me/owner/manager",
    biggestDifficulty: "",
    desiredFeatures: [] as string[],
    processImprovement: "",
  });

  if (!isOpen) return null;

  const handleCheckboxToggle = (field: "paymentMethods" | "desiredFeatures", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission / storage
    setTimeout(() => {
      setSubmitting(false);
      setStep("submitted");
      toast.success("Registration details submitted successfully!");
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: INTRO INVITATION */}
        {step === "intro" && (
          <div className="p-6 sm:p-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#fcdcc5] bg-[#fff8f5] text-[#7c2d12] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#e8562a]" />
              <span>Limited Early Access</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#010101] tracking-tight leading-snug">
              TODELLAA User Trial
            </h2>

            <p className="text-sm text-[#525252] leading-relaxed font-normal">
              We're offering <strong>two months of free access to our first 15 selected institutions</strong>. Once these places are filled, organisations can access Todellaa through our regular paid packages.
            </p>

            <div className="bg-[#faf9f5] border border-[#ecebe4] rounded-2xl p-4 space-y-2 text-xs text-[#404040]">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a] shrink-0" />
                <span>Manage invoices, payments & outstanding balances with ease.</span>
              </p>
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a] shrink-0" />
                <span>No payment required during your trial.</span>
              </p>
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a] shrink-0" />
                <span>Plans start from GHS 100/month after trial.</span>
              </p>
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#e8562a] shrink-0" />
                <span>Share feedback to shape TODELLAA for your needs.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setStep("form")}
                className="w-full sm:w-auto bg-[#e8562a] hover:bg-[#d44820] text-white font-bold text-sm py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Get Early Access <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto bg-white border border-[#d4d4d4] hover:bg-neutral-50 text-[#010101] font-semibold text-sm py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                View Plans & Pricing
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM & SURVEY */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#e8562a] uppercase tracking-wider mb-1">
                TODELLAA User Trial Registration
              </div>
              <h3 className="text-xl font-bold text-[#010101]">Early Access Survey</h3>
              <p className="text-xs text-neutral-500 mt-1">Please complete this short registration form to secure your trial spot.</p>
            </div>

            {/* SECTION 1: CONTACT & ORG */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-1">
                Section 1 — Contact & Organisation
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Full Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="Ama Serwaa"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Organisation Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="Serwaa Beauty Salon / Academy"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Your Role*</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a] bg-white"
                  >
                    <option>Owner</option>
                    <option>Manager</option>
                    <option>Administrator</option>
                    <option>Finance/Accounts</option>
                    <option>Staff</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    required
                    placeholder="054 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="ama@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Organisation Type*</label>
                <select
                  value={formData.orgType}
                  onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a] bg-white"
                >
                  <option>School</option>
                  <option>Training institution</option>
                  <option>Salon/Beauty business</option>
                  <option>Retail/business (instalment payments)</option>
                  <option>NGO</option>
                  <option>Church/Religious organisation</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* SECTION 2: YOUR BUSINESS */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-1">
                Section 2 — Your Business & Payments
              </h4>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">Approximately how many customers/students do you manage?</label>
                <div className="flex flex-wrap gap-2">
                  {["1–50", "51–100", "101–300", "301–1,000", "More than 1,000"].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setFormData({ ...formData, customerCount: count })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.customerCount === count
                          ? "bg-[#e8562a] text-white border-[#e8562a]"
                          : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">How do your customers usually pay you? (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Mobile Money", "Bank transfer", "Card", "Cash", "Other"].map((method) => (
                    <label key={method} className="flex items-center gap-2 text-xs text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.includes(method)}
                        onChange={() => handleCheckboxToggle("paymentMethods", method)}
                        className="rounded text-[#e8562a] focus:ring-[#e8562a]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Number of people involved in collecting/reconciling payments</label>
                <input
                  type="text"
                  placeholder="e.g. 2 staff members"
                  value={formData.staffCount}
                  onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                />
              </div>
            </div>

            {/* SECTION 3: CURRENT PAYMENT TRACKING */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-1">
                Section 3 — Current Payment Tracking
              </h4>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">How do you currently record payments received?</label>
                <select
                  value={formData.recordingMethod}
                  onChange={(e) => setFormData({ ...formData, recordingMethod: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a] bg-white"
                >
                  <option>Notebook/receipt book</option>
                  <option>Excel/Google Sheets</option>
                  <option>Accounting software</option>
                  <option>Another system</option>
                  <option>We don't have a formal system</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">What is your biggest difficulty when tracking payments and outstanding balances?</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Matching MoMo payments to invoice receipts takes too much time..."
                  value={formData.biggestDifficulty}
                  onChange={(e) => setFormData({ ...formData, biggestDifficulty: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:ring-2 focus:ring-[#e8562a]"
                />
              </div>
            </div>

            {/* SECTION 4: WHAT YOU WANT */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-1">
                Section 4 — What You Need
              </h4>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">What would you most like TODELLAA to help you with?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Creating invoices/receipts",
                    "Recording payments",
                    "Checking/confirming payments",
                    "Tracking outstanding balances",
                    "Reconciling payments",
                    "Reports",
                    "Monitoring staff/payment activity",
                  ].map((feature) => (
                    <label key={feature} className="flex items-center gap-2 text-xs text-neutral-700 bg-neutral-50 p-2 rounded-lg border border-neutral-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.desiredFeatures.includes(feature)}
                        onChange={() => handleCheckboxToggle("desiredFeatures", feature)}
                        className="rounded text-[#e8562a] focus:ring-[#e8562a]"
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setStep("intro")}
                className="text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#e8562a] hover:bg-[#d44820] text-white font-bold text-xs py-3 px-8 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Submit Registration
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUBMITTED CONFIRMATION */}
        {step === "submitted" && (
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#010101]">Thank You!</h3>

            <p className="text-sm text-[#525252] max-w-md mx-auto leading-relaxed">
              We've received your details. We'll contact you shortly with your TODELLAA access information.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="bg-[#010101] hover:bg-neutral-800 text-white font-bold text-xs py-3 px-8 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
