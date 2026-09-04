/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Upload,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Camera,
  Zap,
  Scan,
  Clock,
  Building2,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  Info,
  Lock,
  Eye,
  CreditCard,
  ChevronDown,
  Check,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/invoice/$invoiceId")({
  head: () => ({ meta: [{ title: "Pay Invoice — Todellaa" }] }),
  component: InvoicePortalPage,
});

// ─── Backend API URL ───
const API_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
};

// ─── Scanning Animation Messages ───
const SCAN_MESSAGES = [
  { pct: 5, msg: "Initializing secure scanning protocol..." },
  { pct: 15, msg: "Decrypting uploaded screenshot metadata..." },
  { pct: 25, msg: "Connecting to secure matching engine..." },
  { pct: 40, msg: "Extracting text tokens via OCR pipeline..." },
  { pct: 55, msg: "Analyzing receipt layout and structure..." },
  { pct: 65, msg: "Cross-validating extracted fields..." },
  { pct: 75, msg: "Consensus engine comparing results..." },
  { pct: 85, msg: "Cross-referencing against ledger expected amount..." },
  { pct: 92, msg: "Finalizing reconciliation verdict..." },
  { pct: 100, msg: "Analysis complete." },
];

function InvoicePortalPage() {
  const { invoiceId } = Route.useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Scanning state
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Result state
  const [result, setResult] = useState<any>(null);

  // Dev simulation
  const [simMode, setSimMode] = useState<"none" | "success" | "fail">("none");

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // User role check client-side
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (roleRow) {
          setUserRole(roleRow.role);
        }
      }
    }
    checkUserRole();
  }, []);

  const isStaff =
    userRole === "super_admin" ||
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "finance_staff";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch invoice details
  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`);
        if (!res.ok) throw new Error("Invoice not found");
        const data = await res.json();
        setInvoice(data.invoice);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId]);

  // Handle file selection
  const handleFile = useCallback((f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      alert("Only images (JPEG, PNG) and PDF files are supported");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
    setResult(null);
  }, []);

  // Drop handlers
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  // Submit & verify receipt
  const handleVerify = async () => {
    if (!file && simMode === "none") return;

    setScanning(true);
    setResult(null);

    try {
      let base64 = "";
      if (file && simMode === "none") {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
      }

      const res = await fetch(`${API_URL}/api/invoices/${invoiceId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_base64: base64 || undefined,
          simulate_status: simMode !== "none" ? simMode : undefined,
        }),
      });

      const data = await res.json();
      setResult(data);

      // Refresh invoice
      const invoiceRes = await fetch(`${API_URL}/api/invoices/${invoiceId}`);
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        setInvoice(invoiceData.invoice);
      }
    } catch (err: any) {
      setResult({ status: "error", message: err.message || "Upload failed" });
    } finally {
      setScanning(false);
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-indigo-300 text-sm font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Invoice Not Found</h1>
          <p className="text-slate-400 text-sm">
            {error || "This invoice link may be invalid or expired."}
          </p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const isReview = invoice.status === "review_required";
  const orgName = invoice.organizations?.name || "Todellaa";
  const initials =
    invoice.customers?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TL";

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Premium Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-[140px]" />
      </div>

      {/* ─── Top Header Navigation Bar (Image 2 Layout) ─── */}
      <header className="relative z-20 w-full bg-[#0d1321]/80 backdrop-blur-xl border-b border-white/[0.05] py-4 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/20">
              <span className="text-xl font-bold text-white">❖</span>
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-tight">
                {orgName}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Invoice Payment & Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="mailto:support@todellaa.com"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Need Help?</span>
            </a>

            <div className="h-px w-4 bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center border border-white/10 text-white font-bold text-xs shadow-md">
                {initials}
              </div>
              <span className="text-xs font-bold text-slate-300 hidden md:inline truncate max-w-[120px]">
                {invoice.customers?.name || "Customer"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-500 hidden md:block" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
        {/* ─── Hero / Title Area (Image 2 Style) ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Upload Payment Proof
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Please upload your payment receipt to help us verify your payment.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-2xl p-4 shadow-xl self-start md:self-auto">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Lock className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                Secure &amp; Encrypted
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Your data is safe with us</p>
            </div>
          </div>
        </div>

        {/* ─── 1. Invoice Details Card (Image 2 Grid Layout) ─── */}
        <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500/0" />

          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.05] mb-6">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase">
                Invoice Details
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const custName = invoice.customers?.name || "Customer";
                  const amt = invoice.amount || 0;
                  const shareUrl = window.location.href;
                  const msg = `Hello ${custName}, your invoice from ${orgName} is GHS ${amt}. View invoice / confirm payment: ${shareUrl}`;
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                  window.open(waUrl, "_blank");
                }}
                className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                💬 Share via WhatsApp
              </button>

              <span
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                  isPaid
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
                    : isReview
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5"
                }`}
              >
                {invoice.status === "review_required" ? "Under Review" : invoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Invoice ID */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-0.5">
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Invoice ID
                </p>
                <h4 className="text-sm font-bold text-white mt-1">{invoice.invoice_number}</h4>
              </div>
            </div>

            {/* Customer Name */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-0.5">
                <User className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                  Customer Name
                </p>
                <h4 className="text-sm font-bold text-white mt-1 truncate">
                  {invoice.customers?.name || "—"}
                </h4>
              </div>
            </div>

            {/* Amount Due */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mt-0.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Amount Due
                </p>
                <h4 className="text-base font-black text-emerald-400 mt-0.5">
                  {formatCurrency(Number(invoice.amount))}
                </h4>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-0.5">
                <Calendar className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Due Date
                </p>
                <h4 className="text-sm font-bold text-white mt-1">
                  {formatDate(invoice.due_date)}
                </h4>
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors relative group">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-0.5">
                <CreditCard className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Account Number
                </p>
                {invoice.customers?.account_number ? (
                  <button
                    onClick={() => copyToClipboard(invoice.customers.account_number, "account")}
                    className="flex items-center gap-1.5 hover:text-indigo-400 text-sm font-mono font-bold text-white mt-1 transition-colors w-full justify-between"
                  >
                    <span className="truncate">{invoice.customers.account_number}</span>
                    <div className="h-6 w-6 rounded-md bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedField === "account" ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400" />
                      )}
                    </div>
                  </button>
                ) : (
                  <h4 className="text-sm font-bold text-slate-500 mt-1 italic">Not Available</h4>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="flex items-start gap-3 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mt-0.5">
                <Building2 className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                  Organization
                </p>
                <h4 className="text-sm font-bold text-white mt-1 truncate">{orgName}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. Upload Payment Receipt Card (Image 2 Style) ─── */}
        {!isPaid && !scanning && !result && (
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.05] mb-5">
              <Upload className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase">
                Upload Payment Receipt
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Upload a clear image or PDF of your payment receipt or bank transfer confirmation
              below. Our system will scan and verify it.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* Premium Dashed Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                dragOver
                  ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
                  : file
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40"
                    : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              {file ? (
                <div className="space-y-4 w-full max-w-md">
                  {preview && (
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="max-h-40 mx-auto rounded-xl border border-white/10 shadow-xl object-contain"
                    />
                  )}
                  {/* File card detail progress row */}
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 w-full gap-3 shadow-inner">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <FileText className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate pr-1">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase hover:text-indigo-400 transition-colors">
                    Click to choose another file
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-14 w-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                    <Upload className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Drag &amp; drop your file here
                    </p>
                    <p className="text-xs text-indigo-400/80 font-bold mt-1">or click to browse</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Supported formats: JPG, PNG, PDF • Max size: 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Verify Button */}
            {(file || simMode !== "none") && (
              <button
                onClick={handleVerify}
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.99] border border-indigo-400/10"
              >
                <Upload className="h-4.5 w-4.5 animate-pulse" />
                Upload Receipt
              </button>
            )}
          </div>
        )}

        {/* ─── Uploading Animation Overlay ─── */}
        {scanning && (
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-10 shadow-2xl text-center flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
            <h3 className="text-lg font-black text-white mb-1">Scanning Receipt</h3>
            <p className="text-xs text-indigo-300 max-w-sm mx-auto leading-relaxed">
              Your payment proof is being analyzed securely by the matching engine. Please do not close
              this window.
            </p>
          </div>
        )}

        {/* ─── Result Display (Alerts Layout from Image 2) ─── */}
        {result && !scanning && (
          <div className="space-y-6">
            {/* Dynamic Alert Banner (Sleek Horizontal Image 2 Style) */}
            {result.status === "matched" ? (
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-400">
                      Receipt Verified Successfully!
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your payment of{" "}
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(result.extracted?.amount || 0)}
                      </span>{" "}
                      has been matched and reconciled immediately.
                    </p>
                    {result.extracted?.transaction_id && (
                      <p className="text-[10px] font-mono text-slate-500 mt-1.5 uppercase tracking-wider">
                        Transaction Ref: {result.extracted.transaction_id}
                      </p>
                    )}
                  </div>
                </div>

                {(preview || invoice?.receipt_url) && (
                  <a
                    href={preview || invoice?.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-slate-900 border border-white/[0.08] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-md"
                  >
                    <Eye className="h-4 w-4" />
                    View Receipt
                  </a>
                )}
              </div>
            ) : result.status === "review_required" ? (
              <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-400">
                      Receipt Submitted for Review
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your receipt has been logged. Our audit team will verify this within one
                      business day and send a confirmation to your email.
                    </p>
                  </div>
                </div>

                {(preview || invoice?.receipt_url) && (
                  <a
                    href={preview || invoice?.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-slate-900 border border-white/[0.08] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-md"
                  >
                    <Eye className="h-4 w-4" />
                    View Receipt
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-rose-950/40 border border-rose-500/20 rounded-2xl p-5 shadow-2xl flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-400">Verification Error</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {result.message ||
                      "We could not extract invoice parameters from the uploaded receipt. Please make sure the text is clear."}
                  </p>
                </div>
              </div>
            )}

            {/* Try Again controls */}
            {!isPaid && result?.status !== "review_required" && (
              <button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setPreview(null);
                }}
                className="w-full py-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] text-slate-200 font-bold text-sm transition-all"
              >
                Try Again / Choose Another File
              </button>
            )}
          </div>
        )}

        {/* Already Paid Banner (If landed on page already paid) */}
        {isPaid && !result && (
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-400">Invoice Fully Paid</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This invoice has already been successfully verified and logged as paid. No further
                action is required from your side.
              </p>
            </div>
          </div>
        )}

        {/* ─── 3. What Happens Next Card (Image 2 Bottom Section) ─── */}
        <div className="bg-indigo-950/20 border border-indigo-500/[0.15] rounded-2xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="max-w-xl">
              <h4 className="text-sm font-black text-white">What happens next?</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Our finance team will review your payment proof and update the status once verified.
                You'll receive a confirmation email instantly.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex h-16 w-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 items-center justify-center shrink-0">
            <Mail className="h-6 w-6 text-indigo-400/40" />
          </div>
        </div>
      </main>

      {/* ─── Dev Simulation Bar ─── */}
      {isStaff && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d1321]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-2xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Dev Sandbox
          </span>
          <button
            onClick={() => setSimMode(simMode === "success" ? "none" : "success")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              simMode === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-white/5 text-slate-400 border-white/[0.05] hover:bg-white/10"
            }`}
          >
            Force Match
          </button>
          <button
            onClick={() => setSimMode(simMode === "fail" ? "none" : "fail")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              simMode === "fail"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-white/5 text-slate-400 border-white/[0.05] hover:bg-white/10"
            }`}
          >
            Force Mismatch
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full relative z-10 border-t border-white/[0.04] py-6 px-4 bg-[#080b13] mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} {orgName}. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-650 flex items-center gap-1.5 justify-center">
            <span>
              Secured by <span className="font-bold text-indigo-400/80">Todellaa</span>
            </span>
            <span>•</span>
            <span>End-to-end encrypted</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

