/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Banknote,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  RefreshCw,
  Layers,
  ShieldAlert,
  CheckCircle,
  RotateCcw,
  ClipboardList,
  FileText as FileTextIcon,
  CreditCard,
  BarChart3,
  X,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { DateRangeFilter, DateRangeFilterValue } from "@/components/date-range-filter";

function AIDashboardInsights({ stats, orgId }: { stats: any; orgId?: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    const cached = sessionStorage.getItem(`todella_dashboard_ai_summary_${orgId}`);
    if (cached) {
      setSummary(cached);
    } else {
      setSummary(null);
    }
  }, [orgId]);

  const generateSummary = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/dashboard-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: orgId,
          stats: {
            expected: stats.expected,
            received: stats.received,
            due: stats.due,
            partialCount: stats.partialCount,
            unpaidCount: stats.unpaidCount,
            duplicateCount: stats.duplicateCount,
            mismatchCount: stats.mismatchCount,
            completedRefundsCount: stats.completedRefundsCount,
            completedRefundsAmount: stats.completedRefundsAmount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate summary: status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.summary) {
        setSummary(resData.summary);
        sessionStorage.setItem(`todella_dashboard_ai_summary_${orgId}`, resData.summary);
      } else {
        throw new Error(resData.error || "Insights pipeline failure");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#e8562a]/20 bg-linear-to-r from-[#e8562a]/10 via-card to-[#e8562a]/5 backdrop-blur-xl shadow-[var(--shadow-card)] rounded-[2rem] overflow-hidden p-6 border transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#e8562a]/15 flex items-center justify-center text-[#e8562a] shrink-0 border border-[#e8562a]/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground font-sans">Smart Dashboard Insights</h3>
            <p className="text-xs text-muted-foreground">Automated ledger analysis and auditing recommendations</p>
          </div>
        </div>
        {!summary && !loading && (
          <Button
            onClick={generateSummary}
            className="bg-[#e8562a] hover:bg-[#d44820] text-white font-bold shadow-md px-5 h-9 text-xs rounded-full shrink-0 cursor-pointer"
          >
            Generate Insights
          </Button>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2.5 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-[#e8562a]" />
          <span>Analyzing ledger reconciliation trends and checking duplicate payloads...</span>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-rose-500 font-medium">
          Error loading insights: {error}. Please verify configuration.
        </p>
      )}

      {summary && (
        <div className="mt-4 text-sm text-foreground/90 leading-relaxed font-medium animate-fade-in border-t border-[#e8562a]/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="flex-1">{summary}</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-muted-foreground hover:text-foreground h-7 rounded-lg"
            onClick={generateSummary}
            disabled={loading}
          >
            Regenerate
          </Button>
        </div>
      )}
    </Card>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Todellaa" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { organization, profile, role } = useAuth();
  const currency = organization?.currency ?? "GHS";
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [isAutoDismissed, setIsAutoDismissed] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [manualDoneState, setManualDoneState] = useState<Record<number, boolean>>({});
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (!organization?.id) return;
    const dismissedKey = `todella_onboarding_dismissed_${organization.id}`;
    const firstSeenKey = `todella_onboarding_first_seen_${organization.id}`;
    const manualDoneKey = `todella_onboarding_manual_done_${organization.id}`;

    const isDismissed = localStorage.getItem(dismissedKey) === "true";
    setWizardDismissed(isDismissed);

    try {
      const savedManual = localStorage.getItem(manualDoneKey);
      if (savedManual) {
        setManualDoneState(JSON.parse(savedManual));
      } else {
        setManualDoneState({});
      }
    } catch {
      setManualDoneState({});
    }

    let firstSeen = localStorage.getItem(firstSeenKey);
    if (!firstSeen) {
      firstSeen = Date.now().toString();
      localStorage.setItem(firstSeenKey, firstSeen);
    }

    const firstSeenTime = parseInt(firstSeen, 10);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - firstSeenTime > thirtyDaysMs) {
      setIsAutoDismissed(true);
    }
  }, [organization?.id, resetVersion]);

  const handleResetWizard = () => {
    if (organization?.id) {
      const dismissedKey = `todella_onboarding_dismissed_${organization.id}`;
      const manualDoneKey = `todella_onboarding_manual_done_${organization.id}`;
      const visitedReportsKey = `todella_visited_reports_${organization.id}`;
      const resetActiveKey = `todella_onboarding_reset_active_${organization.id}`;

      localStorage.removeItem(dismissedKey);
      localStorage.removeItem(visitedReportsKey);
      localStorage.removeItem(manualDoneKey);
      localStorage.setItem(resetActiveKey, "true");
    }
    setWizardDismissed(false);
    setIsAutoDismissed(false);
    setManualDoneState({});
    setResetVersion((prev) => prev + 1);
  };

  const handleDismiss = () => {
    if (organization?.id) {
      const dismissedKey = `todella_onboarding_dismissed_${organization.id}`;
      localStorage.setItem(dismissedKey, "true");
    }
    setWizardDismissed(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", organization?.id, dateRange],
    enabled: !!organization?.id,
    queryFn: async () => {
      let customersQuery = supabase.from("customers").select("id, expected_amount, due_amount, status, created_at");
      let paymentsQuery = supabase
        .from("payments")
        .select(
          "id, amount_paid, status, payment_date, customer_id, reference, payment_method, source",
        );
      let refundsQuery = (supabase as any).from("refunds").select("id, refund_amount, status, created_at");
      let alertsQuery = (supabase as any).from("alerts").select("id, type, amount, resolved, created_at");

      if (dateRange.startDate) {
        customersQuery = customersQuery.gte("created_at", dateRange.startDate);
        paymentsQuery = paymentsQuery.gte("payment_date", dateRange.startDate.slice(0, 10));
        refundsQuery = refundsQuery.gte("created_at", dateRange.startDate);
        alertsQuery = alertsQuery.gte("created_at", dateRange.startDate);
      }
      if (dateRange.endDate) {
        customersQuery = customersQuery.lte("created_at", dateRange.endDate);
        paymentsQuery = paymentsQuery.lte("payment_date", dateRange.endDate.slice(0, 10));
        refundsQuery = refundsQuery.lte("created_at", dateRange.endDate);
        alertsQuery = alertsQuery.lte("created_at", dateRange.endDate);
      }

      const [{ data: customers }, { data: payments }, { data: refunds }, { data: alerts }] = await Promise.all([
        customersQuery,
        paymentsQuery.order("payment_date", { ascending: false }),
        refundsQuery,
        alertsQuery,
      ]);
      const expected = (customers ?? []).reduce((s, c) => s + Number(c.expected_amount ?? 0), 0);
      const received = (payments ?? []).reduce((s, p) => s + Number(p.amount_paid ?? 0), 0);
      const due = (customers ?? []).reduce((s, c) => s + Number(c.due_amount ?? 0), 0);

      const partialCount = (customers ?? []).filter((c) => c.status === "partial").length;
      const unpaidCount = (customers ?? []).filter((c) => c.status === "unpaid").length;
      const duplicateCount = (payments ?? []).filter((p) => p.status === "duplicate").length;
      const mismatchCount = (payments ?? []).filter((p) => p.status === "mismatch").length;

      const completedRefundsCount = ((refunds as any[]) ?? []).filter(
        (r) => r.status === "completed",
      ).length;
      const completedRefundsAmount = ((refunds as any[]) ?? [])
        .filter((r) => r.status === "completed")
        .reduce((s, r) => s + Number(r.refund_amount ?? 0), 0);
      const pendingRefundsCount = ((refunds as any[]) ?? []).filter(
        (r) => r.status === "pending",
      ).length;

      const overpaymentAlerts = ((alerts as any[]) ?? []).filter((a) => a.type === "overpayment" && !a.resolved);
      const overpaymentCount = overpaymentAlerts.length;
      const overpaymentAmount = overpaymentAlerts.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0);

      const byDay = new Map<string, number>();
      (payments ?? []).forEach((p) => {
        const key = p.payment_date;
        byDay.set(key, (byDay.get(key) ?? 0) + Number(p.amount_paid));
      });
      const chart = Array.from(byDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
        .map(([date, amount]) => ({ date: date.slice(5), amount }));

      return {
        expected,
        received,
        due,
        partialCount,
        unpaidCount,
        duplicateCount,
        mismatchCount,
        completedRefundsCount,
        completedRefundsAmount,
        pendingRefundsCount,
        recent: (payments ?? []).slice(0, 5),
        chart,
        overpaymentCount,
        overpaymentAmount,
      };
    },
  });

  // Fetch counts for onboarding wizard completion check
  const { data: onboardingData } = useQuery({
    queryKey: ["onboarding-check", organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const [{ count: svcCount }, { count: custCount }, { count: invCount }, { count: payCount }] =
        await Promise.all([
          supabase.from("services").select("id", { count: "exact", head: true }),
          supabase.from("customers").select("id", { count: "exact", head: true }),
          (supabase as any).from("invoices").select("id", { count: "exact", head: true }),
          supabase.from("payments").select("id", { count: "exact", head: true }),
        ]);
      return {
        services: svcCount ?? 0,
        customers: custCount ?? 0,
        invoices: invCount ?? 0,
        payments: payCount ?? 0,
      };
    },
  });

  const isResetActive = typeof window !== "undefined" && organization?.id
    ? localStorage.getItem(`todella_onboarding_reset_active_${organization.id}`) === "true"
    : false;

  const getStepDone = (index: number, dbCondition: boolean) => {
    if (manualDoneState[index] !== undefined) {
      return manualDoneState[index];
    }
    if (isResetActive) {
      return false;
    }
    return dbCondition;
  };

  const onboardingSteps = [
    {
      title: "Create Services",
      description: "Set up your rate card with coaching, hostel, library fees.",
      done: getStepDone(0, (onboardingData?.services ?? 0) > 0),
      href: "/services",
    },
    {
      title: "Add Customers",
      description: "Register the clients you will bill.",
      done: getStepDone(1, (onboardingData?.customers ?? 0) > 0),
      href: "/customers",
    },
    {
      title: "Create Invoice",
      description: "Generate your first payment request.",
      done: getStepDone(2, (onboardingData?.invoices ?? 0) > 0),
      href: "/invoices",
    },
    {
      title: "Import Payments",
      description: "Upload a payment file or record a manual entry.",
      done: getStepDone(3, (onboardingData?.payments ?? 0) > 0),
      href: "/payments",
    },
    {
      title: "View Reports",
      description: "Check analytics and audit reports.",
      done: getStepDone(4, typeof window !== "undefined" && (localStorage.getItem(`todella_visited_reports_${organization?.id}`) === "true" || (data?.chart?.length ?? 0) > 0)),
      href: "/reports",
    },
  ];

  const stepsCompleted = onboardingSteps.filter((s) => s.done).length;
  const isViewer = role === "viewer";
  const showWizard = !isViewer && !wizardDismissed && !isAutoDismissed;

  const moneyKpis = [
    {
      label: "Total Expected Amount",
      value: data?.expected ?? 0,
      icon: TrendingUp,
      tone: "text-[#e8562a] dark:text-[#f06e42] bg-[#e8562a]/10 dark:bg-[#e8562a]/20 border-orange-200 dark:border-orange-500/20",
      isCurrency: true,
    },
    {
      label: "Total Received",
      value: data?.received ?? 0,
      icon: Banknote,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      isCurrency: true,
    },
    {
      label: "Total Due / Balance",
      value: data?.due ?? 0,
      icon: Clock,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      isCurrency: true,
    },
  ];

  const auditKpis = [
    {
      label: "Unpaid Customers",
      count: data?.unpaidCount ?? 0,
      icon: Users,
      tone: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
    },
    {
      label: "Partial Payments",
      count: data?.partialCount ?? 0,
      icon: RefreshCw,
      tone: "text-amber-500 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/60 dark:border-amber-500/15",
    },
    {
      label: "Duplicate Payments",
      count: data?.duplicateCount ?? 0,
      icon: Layers,
      tone: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
    },
    {
      label: "Mismatch Payments",
      count: data?.mismatchCount ?? 0,
      icon: ShieldAlert,
      tone: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20",
    },
    {
      label: "Overpayments",
      count: data?.overpaymentCount ?? 0,
      icon: AlertTriangle,
      tone: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20",
    },
  ];

  const refundKpis = [
    {
      label: "Pending Refund Requests",
      count: data?.pendingRefundsCount ?? 0,
      icon: ShieldAlert,
      tone: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    },
    {
      label: "Completed Payouts",
      count: data?.completedRefundsCount ?? 0,
      icon: CheckCircle,
      tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
    },
    {
      label: "Total Refunded Payout Value",
      value: data?.completedRefundsAmount ?? 0,
      icon: RotateCcw,
      tone: "text-[#e8562a] dark:text-[#f06e42] bg-[#e8562a]/10 dark:bg-[#e8562a]/20 border-orange-200 dark:border-orange-500/20",
      isCurrency: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Welcome back,{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#e8562a] to-[#f06e42]">
              {profile?.full_name?.split(" ")[0] ?? "there"}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's a breakdown of your payment status and activities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetWizard}
            className="h-9 px-3 text-xs font-semibold gap-1.5 border-[#e8562a]/30 text-[#e8562a] hover:bg-[#e8562a]/10 rounded-xl shrink-0 cursor-pointer"
            title="Reset and re-open onboarding checklist"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Checklist</span>
          </Button>
          <DateRangeFilter onChange={setDateRange} />
        </div>
      </div>

      {/* AI Dashboard Insights */}
      {data && (
        <AIDashboardInsights stats={data} orgId={organization?.id} />
      )}

      {/* Onboarding Wizard */}
      {showWizard && (
        <Card className="relative border-[#e8562a]/30 bg-linear-to-br from-[#e8562a]/5 via-card to-[#e8562a]/5 shadow-[var(--shadow-card)] rounded-2xl overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleResetWizard}
              className="h-7 text-[10px] font-bold px-2.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 cursor-pointer"
              title="Reset onboarding checklist progress"
            >
              Reset Checklist
            </button>
            <button
              onClick={handleDismiss}
              className="h-7 text-[10px] font-bold px-3 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 cursor-pointer"
            >
              I've got it, don't show again
            </button>
            <button
              onClick={handleDismiss}
              className="h-7 w-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-[#e8562a]/15 text-[#e8562a] flex items-center justify-center border border-[#e8562a]/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-foreground font-sans">
                  Getting Started
                </h2>
                <p className="text-xs text-muted-foreground">
                  {stepsCompleted} of {onboardingSteps.length} steps completed
                </p>
              </div>
            </div>

            {stepsCompleted === 5 && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>🎉 Outstanding! You have completed all 5 onboarding steps!</span>
                </div>
                <button
                  onClick={handleResetWizard}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
            )}
            <div className="w-full bg-muted/40 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-[#e8562a] h-full rounded-full transition-all duration-500"
                style={{ width: `${(stepsCompleted / onboardingSteps.length) * 100}%` }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {onboardingSteps.map((step, idx) => (
                <Link key={idx} to={step.href}>
                  <div
                    className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                      step.done
                        ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/5"
                        : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.done
                            ? "bg-emerald-500 text-white"
                            : "bg-muted/60 text-muted-foreground border border-border/60"
                        }`}
                      >
                        {step.done ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-bold ${step.done ? "text-emerald-600 dark:text-emerald-400 line-through" : "text-foreground"}`}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {!step.done && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Go <ChevronRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Viewer Welcome Banner */}
      {isViewer && (
        <Card className="relative border-primary/25 bg-gradient-to-br from-primary/5 via-card to-primary/5 shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground font-sans">
                  Welcome, Viewer
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  You have read-only access to this workspace. Use the sidebar to inspect ledgers,
                  explore customers, trace payout logs, and generate dashboard metrics.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/payments">
                <Button variant="outline" shape="pill" className="h-9 text-xs font-semibold">
                  Inspect Payments
                </Button>
              </Link>
              <Link to="/reports">
                <Button shape="pill" className="h-9 text-xs font-semibold bg-primary text-white">
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Financial KPIs */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">
          Financial Ledgers
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          {moneyKpis.map((k) => (
            <Card
              key={k.label}
              className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-28 mt-2 rounded-full" />
                    ) : (
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        {formatCurrency(k.value, currency)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border ${k.tone}`}
                  >
                    <k.icon className="h-5.5 w-5.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reconciliation Audits */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">
          Reconciliation Audits
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {auditKpis.map((k) => (
            <Card
              key={k.label}
              className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-2 rounded-full" />
                    ) : (
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        {k.count}
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border ${k.tone}`}
                  >
                    <k.icon className="h-5.5 w-5.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Refund and Payout Audits */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 pl-1">
          Refund &amp; Payout Audits
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          {refundKpis.map((k) => (
            <Card
              key={k.label}
              className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-28 mt-2 rounded-full" />
                    ) : (
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        {k.isCurrency ? formatCurrency(k.value ?? 0, currency) : (k.count ?? 0)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border ${k.tone}`}
                  >
                    <k.icon className="h-5.5 w-5.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payments BarChart */}
        <Card className="lg:col-span-2 border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground font-sans">Payment Flow</h2>
              <p className="text-xs text-muted-foreground">
                Daily transactional volume for the last 7 active days
              </p>
            </div>
          </div>
          <div className="h-72">
            {(data?.chart.length ?? 0) === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
                <p>No payments recorded yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/40"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-[10px] font-medium fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-[10px] font-medium fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "1rem",
                      boxShadow: "var(--shadow-elegant)",
                    }}
                    labelStyle={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      color: "var(--color-foreground)",
                    }}
                    itemStyle={{ fontSize: "12px", color: "var(--color-primary)" }}
                    formatter={(v: number) => [formatCurrency(v, currency), "Volume"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#e8562a"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Recent Payments Panel */}
        <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground font-sans">Recent Payments</h2>
            <p className="text-xs text-muted-foreground">Latest transactions processed</p>
          </div>
          <div className="space-y-4">
            {(data?.recent.length ?? 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No transactions found.</p>
              </div>
            ) : (
              data?.recent.map((p) => {
                const isSuccess = p.status === "paid";
                const isFail = p.status === "mismatch" || p.status === "duplicate";

                let badgeClass =
                  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20";
                if (isSuccess)
                  badgeClass =
                    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
                if (isFail)
                  badgeClass =
                    "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-sm tracking-tight text-foreground">
                        {p.reference ?? "Direct Payment"}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {formatDate(p.payment_date)} ·{" "}
                        <span className="uppercase text-[10px] font-bold text-primary">
                          {p.source}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="font-extrabold text-sm text-foreground">
                        {formatCurrency(Number(p.amount_paid), currency)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase border ${badgeClass}`}
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
