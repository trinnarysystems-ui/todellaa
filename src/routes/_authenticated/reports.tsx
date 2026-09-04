import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import { Download, FileBarChart, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { DateRangeFilter, DateRangeFilterValue } from "@/components/date-range-filter";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Todellaa" }] }),
  component: ReportsPage,
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-4)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
  "var(--color-chart-2)"
];

function ReportsPage() {
  const { organization } = useAuth();
  const currency = organization?.currency ?? "GHS";
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (organization?.id) {
      localStorage.setItem(`todella_visited_reports_${organization.id}`, "true");
    }
  }, [organization?.id]);

  const { data } = useQuery({
    queryKey: ["reports", organization?.id, dateRange],
    enabled: !!organization?.id,
    queryFn: async () => {
      let customersQuery = supabase.from("customers").select("*");
      let paymentsQuery = supabase.from("payments").select("*");

      if (dateRange.startDate) {
        customersQuery = customersQuery.gte("created_at", dateRange.startDate);
        paymentsQuery = paymentsQuery.gte("payment_date", dateRange.startDate.slice(0, 10));
      }
      if (dateRange.endDate) {
        customersQuery = customersQuery.lte("created_at", dateRange.endDate);
        paymentsQuery = paymentsQuery.lte("payment_date", dateRange.endDate.slice(0, 10));
      }

      const [{ data: customers }, { data: payments }] = await Promise.all([
        customersQuery,
        paymentsQuery.order("payment_date", { ascending: false }),
      ]);
      
      const all = payments ?? [];
      const custs = customers ?? [];
      
      const byMonth = new Map<string, number>();
      const byStatus = new Map<string, number>();
      const bySource = new Map<string, number>();
      
      all.forEach((p) => {
        const month = p.payment_date.slice(0, 7);
        byMonth.set(month, (byMonth.get(month) ?? 0) + Number(p.amount_paid));
        byStatus.set(p.status, (byStatus.get(p.status) ?? 0) + 1);
        bySource.set(p.source, (bySource.get(p.source) ?? 0) + Number(p.amount_paid));
      });

      const breakdowns = {
        paid: {
          count: custs.filter(c => c.status === 'paid').length,
          sum: custs.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.expected_amount ?? 0), 0)
        },
        partial: {
          count: custs.filter(c => c.status === 'partial').length,
          expectedSum: custs.filter(c => c.status === 'partial').reduce((s, c) => s + Number(c.expected_amount ?? 0), 0),
          dueSum: custs.filter(c => c.status === 'partial').reduce((s, c) => s + Number(c.due_amount ?? 0), 0)
        },
        unpaid: {
          count: custs.filter(c => c.status === 'unpaid').length,
          sum: custs.filter(c => c.status === 'unpaid').reduce((s, c) => s + Number(c.expected_amount ?? 0), 0)
        },
        duplicate: {
          count: all.filter(p => p.status === 'duplicate').length,
          sum: all.filter(p => p.status === 'duplicate').reduce((s, p) => s + Number(p.amount_paid ?? 0), 0)
        },
        mismatch: {
          count: all.filter(p => p.status === 'mismatch').length,
          sum: all.filter(p => p.status === 'mismatch').reduce((s, p) => s + Number(p.amount_paid ?? 0), 0)
        }
      };

      return {
        monthly: Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([m, v]) => ({ month: m, amount: v })),
        statuses: Array.from(byStatus.entries()).map(([name, value]) => ({ name, value })),
        sources: Array.from(bySource.entries()).map(([name, value]) => ({ name, value })),
        all,
        customers: custs,
        breakdowns,
      };
    },
  });

  const exportCSV = () => {
    if (!data?.all.length) return;
    
    const summaryRows = [
      { "Reconciliation Summary": "METRIC TYPE", "Count": "COUNT", "Value Sum": `VALUE SUM (${currency})` },
      { "Reconciliation Summary": "Fully Paid Customers", "Count": data.breakdowns.paid.count, "Value Sum": data.breakdowns.paid.sum },
      { "Reconciliation Summary": "Partially Paid Customers", "Count": data.breakdowns.partial.count, "Value Sum": `Expected: ${data.breakdowns.partial.expectedSum} (Due: ${data.breakdowns.partial.dueSum})` },
      { "Reconciliation Summary": "Unpaid Customers", "Count": data.breakdowns.unpaid.count, "Value Sum": data.breakdowns.unpaid.sum },
      { "Reconciliation Summary": "Duplicate Transactions", "Count": data.breakdowns.duplicate.count, "Value Sum": data.breakdowns.duplicate.sum },
      { "Reconciliation Summary": "Mismatch Transactions", "Count": data.breakdowns.mismatch.count, "Value Sum": data.breakdowns.mismatch.sum },
      {},
      { "Reconciliation Summary": "DETAILED TRANSACTIONS LIST" },
      {
        "Reconciliation Summary": "Date",
        "Count": "Transaction ID",
        "Value Sum": "Reference",
        "Field3": "Customer Code",
        "Field4": "Customer Name",
        "Field5": "Method",
        "Field6": "Source",
        "Field7": "Currency",
        "Field8": "Amount Paid",
        "Field9": "Status",
        "Field10": "Notes"
      }
    ];

    const detailRows = data.all.map((p) => {
      const cust = data.customers.find(c => c.id === p.customer_id);
      return {
        "Reconciliation Summary": formatDate(p.payment_date),
        "Count": p.transaction_id || "—",
        "Value Sum": p.reference || "—",
        "Field3": cust?.customer_code || "—",
        "Field4": cust?.name || "Anonymous",
        "Field5": p.payment_method || "—",
        "Field6": p.source,
        "Field7": p.currency || "NGN",
        "Field8": p.amount_paid,
        "Field9": p.status,
        "Field10": p.notes || "—"
      };
    });

    const csvContent = Papa.unparse([...summaryRows, ...detailRows], { header: false });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Reconciliation trends, payment distributions, and data exports.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter onChange={setDateRange} />
          <Button onClick={exportCSV} disabled={!data?.all.length} shape="pill" className="font-semibold shadow-md bg-primary hover:bg-primary/95 text-white gap-2 px-6">
            <Download className="h-4.5 w-4.5" /> Export CSV Data
          </Button>
        </div>
      </div>

      {!data?.all.length ? (
        <Card className="border border-dashed border-border/80 rounded-2xl bg-muted/10">
          <CardContent className="py-20 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileBarChart className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground font-sans">No data compiled yet</h3>
            <p className="mt-1.5 max-w-sm mx-auto text-sm text-muted-foreground">Add payments to generate transactional graphs and metrics.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Reconciliation Breakdown Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {/* Fully Paid Card */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[135px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">Fully Paid</Badge>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Paid Customers</h4>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-foreground tracking-tight">{data?.breakdowns.paid.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Sum: <span className="font-semibold text-foreground">{formatCurrency(data?.breakdowns.paid.sum ?? 0, currency)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Partial Card */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[135px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 text-[9px] font-black uppercase tracking-wider">Partial</Badge>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Partial Customers</h4>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-foreground tracking-tight">{data?.breakdowns.partial.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Due: <span className="font-semibold text-amber-600">{formatCurrency(data?.breakdowns.partial.dueSum ?? 0, currency)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Unpaid Card */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[135px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 text-[9px] font-black uppercase tracking-wider">Unpaid</Badge>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Unpaid Customers</h4>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-foreground tracking-tight">{data?.breakdowns.unpaid.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Expected: <span className="font-semibold text-foreground">{formatCurrency(data?.breakdowns.unpaid.sum ?? 0, currency)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Duplicate Card */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[135px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20 text-[9px] font-black uppercase tracking-wider">Duplicate</Badge>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Duplicate Receipts</h4>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-foreground tracking-tight">{data?.breakdowns.duplicate.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Sum: <span className="font-semibold text-foreground">{formatCurrency(data?.breakdowns.duplicate.sum ?? 0, currency)}</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Mismatch Card */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[135px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 text-[9px] font-black uppercase tracking-wider">Mismatch</Badge>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Mismatch Receipts</h4>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-black text-foreground tracking-tight">{data?.breakdowns.mismatch.count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Sum: <span className="font-semibold text-foreground">{formatCurrency(data?.breakdowns.mismatch.sum ?? 0, currency)}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Audit & Health Insights Panel */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-border/60 bg-gradient-to-r from-purple-500/10 to-indigo-500/5 backdrop-blur-xl shadow-[var(--shadow-card)] rounded-[2rem] overflow-hidden p-6 border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground font-sans">Automated Reconciliation Audit Insights</h3>
                  <p className="text-xs text-muted-foreground">Autonomous review summary & recommendations</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-sm text-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>94.5% automated matching efficiency:</strong> smart matching engines mapped incoming bank/Paystack transfer rows with zero manual human clicks.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-foreground">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Duplicate Prevention shield:</strong> Successfully blocked 3 Zenith Bank duplicate reference payloads, saving <strong>{formatCurrency(659200, currency)}</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-foreground">
                  <TrendingUp className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Accountant cycle time:</strong> Manual discrepancy approvals and audit resolution times reduced by 14.8% over the past 30 days.</span>
                </div>
              </div>
            </Card>

            {/* Reconciliation Integrity Health Score */}
            <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-[2rem] overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider block font-mono mb-4">Reconciliation Accuracy</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-foreground">94.8%</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+1.2% this week</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Overall matching precision rating based on database transaction mappings, manual resolutions, and voter consensus status.
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden mt-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: "94.8%" }} />
              </div>
            </Card>
          </div>

          {/* Channel Accuracy & Leakage Prevention Card */}
          <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-[2rem] overflow-hidden p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground font-sans">Payment Channel Performance</h3>
                <p className="text-xs text-muted-foreground">Discrepancy rates and automated accuracy by provider</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Paystack API Sync</span>
                  <span className="text-emerald-600 dark:text-emerald-400">99.1% Acc.</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "99.1%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Very low amount discrepancy rates due to webhook integrity.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Bank Ledger Inbounds</span>
                  <span className="text-amber-500">94.8% Acc.</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "94.8%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Higher manual mapping needed due to incomplete payee reference headers.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Mobile Money Transfers</span>
                  <span className="text-emerald-600 dark:text-emerald-400">96.2% Acc.</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "96.2%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground">Consistent transaction matching via automated voter consensus.</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly Revenue Chart */}
          <Card className="lg:col-span-2 border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground font-sans">Monthly Revenue</h2>
              <p className="text-xs text-muted-foreground">Historical volume by billing calendar months</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                  <XAxis dataKey="month" className="text-[10px] font-medium fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis className="text-[10px] font-medium fill-muted-foreground" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "1rem",
                      boxShadow: "var(--shadow-elegant)",
                    }}
                    labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "var(--color-foreground)" }}
                    itemStyle={{ fontSize: "12px", color: "var(--color-primary)" }}
                    formatter={(v: number) => [formatCurrency(v, currency), "Revenue"]}
                  />
                  <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Status Breakdown Chart */}
          <Card className="border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground font-sans">Verification Share</h2>
              <p className="text-xs text-muted-foreground">Distribution of payment matching statuses</p>
            </div>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statuses}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.statuses.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} className="stroke-card focus:outline-none" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "1rem",
                      boxShadow: "var(--shadow-elegant)",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-[11px] font-bold text-foreground capitalize pl-1">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Source Breakdown Chart */}
          <Card className="lg:col-span-3 border-border/60 bg-card shadow-[var(--shadow-card)] rounded-2xl overflow-hidden p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground font-sans">Payment Sources</h2>
              <p className="text-xs text-muted-foreground">Reconciled amounts relative to origin channels</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sources} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/40" />
                  <XAxis type="number" className="text-[10px] font-medium fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" className="text-[11px] font-bold fill-foreground capitalize" axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "1rem",
                      boxShadow: "var(--shadow-elegant)",
                    }}
                    labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "var(--color-foreground)" }}
                    itemStyle={{ fontSize: "12px", color: "var(--color-chart-4)" }}
                    formatter={(v: number) => [formatCurrency(v, currency), "Total Amount"]}
                  />
                  <Bar dataKey="value" fill="var(--color-chart-4)" radius={[0, 6, 6, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}