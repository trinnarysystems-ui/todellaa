/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DateRangeFilter, DateRangeFilterValue } from "@/components/date-range-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Todellaa" }] }),
  component: InvoicesPage,
});

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

function InvoicesPage() {
  const { organization, user, role } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    startDate: null,
    endDate: null,
  });

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedCustomerAccountNumber, setSelectedCustomerAccountNumber] = useState<string | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [invoiceDiscountType, setInvoiceDiscountType] = useState<"percentage" | "fixed" | null>(null);
  const [invoiceDiscountValue, setInvoiceDiscountValue] = useState("");
  const [invoiceDiscountRef, setInvoiceDiscountRef] = useState("");
  const currency = organization?.currency ?? "GHS";

  // Auto-generate and auto-populate invoice form based on customer select
  const handleCustomerChange = (val: string) => {
    setCustomerId(val);
    const selected = (customers as any[]).find((c) => c.id === val);
    if (selected) {
      // 1. Auto generate a unique invoice number
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setInvoiceNumber(`INV-${randomId}`);

      // 2. Auto populate customer's expected amount taking discounts into account
      if (selected.expected_amount) {
        let finalFee = Number(selected.expected_amount);
        if (selected.discount_eligible) {
          if (selected.discount_type === "percentage") {
            finalFee = finalFee - (finalFee * (Number(selected.discount_value) || 0)) / 100;
          } else if (selected.discount_type === "fixed") {
            finalFee = finalFee - (Number(selected.discount_value) || 0);
          } else if (selected.discount_type === "scholarship") {
            finalFee = 0;
          }
        }
        setAmount(String(Math.max(0, finalFee)));
      } else {
        setAmount("");
      }

      // 3. Auto populate due date to 7 days from now
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      setDueDate(sevenDays.toISOString().split("T")[0]);

      // 4. Capture account number for display
      setSelectedCustomerAccountNumber(selected.account_number ?? null);
    } else {
      setSelectedCustomerAccountNumber(null);
    }
  };

  // Email outbox state
  const [outboxInvoice, setOutboxInvoice] = useState<any>(null);

  // Selected invoice for review modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Delete invoice states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  // Manual Reconcile States
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [reconcileAmount, setReconcileAmount] = useState("");
  const [reconcileReceiptBase64, setReconcileReceiptBase64] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);

  const handleOpenReconcile = (inv: any) => {
    setSelectedInvoice(inv);
    setReconcileAmount(String(inv.amount));
    setReconcileReceiptBase64(null);
    setIsReconcileOpen(true);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReconcileReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleManualReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amt = parseFloat(reconcileAmount);
    if (isNaN(amt) || amt <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setReconciling(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/invoices/${selectedInvoice.id}/manual-reconcile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actual_amount: amt,
            receipt_base64: reconcileReceiptBase64,
            reconciled_by: user?.id,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Manual reconciliation failed");
      }

      const result = await res.json();
      toast.success(result.message || "Invoice successfully reconciled.");
      setIsReconcileOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices", organization?.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", organization?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organization?.id] });
    } catch (error: any) {
      toast.error(error.message || "Failed to reconcile invoice");
    } finally {
      setReconciling(false);
    }
  };

  const isReadOnly = role === "finance_staff";

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", organization?.id, dateRange],
    enabled: !!organization?.id && (role as any) !== "viewer",
    queryFn: async () => {
      let query = (supabase as any)
        .from("invoices")
        .select(
          `
          *,
          customers!customer_id (
            id,
            name,
            email,
            customer_code,
            status,
            expected_amount,
            due_amount,
            account_number
          )
        `,
        )
        .eq("organization_id", organization!.id);

      if (dateRange.startDate) {
        query = query.gte("created_at", dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte("created_at", dateRange.endDate);
      }

      const { data } = await query.order("created_at", { ascending: false });
      return (data as any[]) ?? [];
    },
  });

  // Fetch customers (for dropdown list)
  const { data: customers = [] } = useQuery({
    queryKey: ["customers", organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select(
          "id, name, email, customer_code, expected_amount, due_amount, account_number, discount_eligible, discount_type, discount_value",
        )
        .eq("organization_id", organization!.id)
        .order("name", { ascending: true });
      return data ?? [];
    },
  });

  // Fetch services for multi-select
  const { data: servicesList = [] } = useQuery({
    queryKey: ["services-list-invoices", organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data } = await supabase.from("services").select("id, name, fee").order("name");
      return data ?? [];
    },
  });

  if ((role as any) === "viewer") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 mb-6">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          Invoice management and records are restricted for your role. Contact your workspace admin
          for details.
        </p>
      </div>
    );
  }

  const toggleService = (svc: any) => {
    setLineItems((prev) => {
      const exists = prev.some((item) => item.serviceId === svc.id);
      if (exists) {
        return prev.filter((item) => item.serviceId !== svc.id);
      } else {
        return [
          ...prev,
          {
            serviceId: svc.id,
            name: svc.name,
            unitPrice: Number(svc.fee),
            quantity: 1,
            discountType: null,
            discountValue: 0,
            discountRef: "",
          },
        ];
      }
    });
  };

  const updateLineItem = (idx: number, key: string, val: any) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const calculateItemSubtotal = (item: any) => {
    const total = item.unitPrice * item.quantity;
    if (!item.discountType) return total;
    if (item.discountType === "percentage") {
      return Math.max(0, total - (total * (item.discountValue || 0)) / 100);
    }
    if (item.discountType === "fixed") {
      return Math.max(0, total - (item.discountValue || 0));
    }
    if (item.discountType === "scholarship") {
      return 0;
    }
    return total;
  };

  const itemsSubtotalSum = lineItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);

  const calculateFinalAmount = () => {
    if (!invoiceDiscountType) return itemsSubtotalSum;
    if (invoiceDiscountType === "percentage") {
      const val = parseFloat(invoiceDiscountValue) || 0;
      return Math.max(0, itemsSubtotalSum - (itemsSubtotalSum * val) / 100);
    }
    if (invoiceDiscountType === "fixed") {
      const val = parseFloat(invoiceDiscountValue) || 0;
      return Math.max(0, itemsSubtotalSum - val);
    }
    return itemsSubtotalSum;
  };

  const finalInvoiceAmount = calculateFinalAmount();

  useEffect(() => {
    if (lineItems.length > 0) {
      setAmount(String(finalInvoiceAmount));
    }
  }, [lineItems, invoiceDiscountType, invoiceDiscountValue, finalInvoiceAmount]);

  // Handle invoice creation (using custom backend API to dispatch Brevo transaction email)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !user?.id) return;
    if (!customerId || !invoiceNumber || !amount || !dueDate) {
      return toast.error("Please fill in all required fields");
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return toast.error("Please enter a valid amount greater than zero");
    }

    setCreating(true);

    try {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      if (!selectedCustomer) throw new Error("Customer not found");

      const response = await fetch(`${BACKEND_URL}/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_id: organization.id,
          customer_id: customerId,
          invoice_number: invoiceNumber,
          amount: amt,
          due_date: dueDate,
          generated_by: user.id,
          customer_email: selectedCustomer.email,
          customer_name: selectedCustomer.name,
          organization_name: organization.name,
          frontend_url: window.location.origin,
          line_items: lineItems.map((item) => ({
            ...item,
            subtotal: calculateItemSubtotal(item),
          })),
          invoice_discount_type: invoiceDiscountType,
          invoice_discount_value: invoiceDiscountValue ? parseFloat(invoiceDiscountValue) : 0,
          invoice_discount_ref: invoiceDiscountRef,
          subtotal: itemsSubtotalSum,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice via backend API");
      }

      const resultData = await response.json();

      toast.success(
        resultData.emailSent
          ? "Invoice created & payment link sent!"
          : "Invoice created successfully (email skipped/failed).",
      );

      setIsCreateOpen(false);

      // Reset form
      setCustomerId("");
      setInvoiceNumber("");
      setAmount("");
      setDueDate("");
      setSelectedCustomerAccountNumber(null);
      setLineItems([]);
      setInvoiceDiscountType(null);
      setInvoiceDiscountValue("");
      setInvoiceDiscountRef("");

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["invoices", organization.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", organization.id] });
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  // Staff Manual Reconciliation approval
  const handleApprove = async (id: string) => {
    setProcessingAction(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/invoices/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_by: user?.id }),
      });
      if (!res.ok) throw new Error("Approval failed");
      toast.success("Invoice successfully approved and reconciled.");
      setIsReviewOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices", organization?.id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to approve invoice");
    } finally {
      setProcessingAction(false);
    }
  };

  // Staff Manual Reconciliation rejection
  const handleReject = async (id: string) => {
    setProcessingAction(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/invoices/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected_by: user?.id }),
      });
      if (!res.ok) throw new Error("Rejection failed");
      toast.success("Receipt rejected. Invoice reset to pending status.");
      setIsReviewOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices", organization?.id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reject invoice");
    } finally {
      setProcessingAction(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any).from("invoices").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Invoice deleted successfully");
    setDeleteId(null);
    setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const onBatchDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await (supabase as any).from("invoices").delete().in("id", selectedIds);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Successfully deleted ${selectedIds.length} invoices!`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
    setBatchDeleteOpen(false);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const custName = inv.customers?.name?.toLowerCase() ?? "";
    const custCode = inv.customers?.customer_code?.toLowerCase() ?? "";
    const invNum = inv.invoice_number.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      custName.includes(search) || custCode.includes(search) || invNum.includes(search);

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const collectedInvoiced = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  const outstandingInvoiced = totalInvoiced - collectedInvoiced;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-wider"
          >
            Paid
          </Badge>
        );
      case "review_required":
        return (
          <Badge
            variant="outline"
            className="rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 text-[10px] font-black uppercase tracking-wider animate-pulse"
          >
            Review Required
          </Badge>
        );
      case "partial":
        return (
          <Badge
            variant="outline"
            className="rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20 text-[10px] font-black uppercase tracking-wider"
          >
            Partial
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 text-[10px] font-black uppercase tracking-wider"
          >
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2.5">
        {selectedIds.length > 0 && !isReadOnly && (
          <Button
            variant="destructive"
            shape="pill"
            className="h-9 text-xs font-bold gap-2 animate-fade-in bg-rose-600 hover:bg-rose-700 text-white shadow-md px-5"
            onClick={() => setBatchDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
          </Button>
        )}

        {!isReadOnly && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                shape="pill"
                className="font-semibold shadow-md bg-primary hover:bg-primary/95 text-white gap-2 px-6"
              >
                <Plus className="h-4.5 w-4.5" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border/60 bg-card shadow-(--shadow-elegant) rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Create New Invoice
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Draft a formal payment request. Submitting updates the linked client expected
                  total balance and dispatches a secure check out email.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="customer"
                    className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider"
                  >
                    Select Customer <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={customerId} onValueChange={handleCustomerChange}>
                    <SelectTrigger className="rounded-full px-5 h-11 border-border/80">
                      <SelectValue placeholder="Pick a customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(customers as any[]).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.customer_code || "No Code"}) — {c.email || "No Email"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomerAccountNumber && (
                    <div className="flex items-center gap-2 mt-1.5 px-4 py-2.5 bg-primary/5 border border-primary/15 rounded-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-primary shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Account Number
                      </span>
                      <span className="ml-auto font-mono font-black text-xs text-primary tracking-widest">
                        {selectedCustomerAccountNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Multi-Select Services */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider">
                    Select Services{" "}
                    <span className="text-muted-foreground/50 font-normal">
                      (optional — auto-sums amount)
                    </span>
                  </Label>
                  {servicesList.length === 0 ? (
                    <p className="text-xs text-muted-foreground pl-1">
                      No services configured.{" "}
                      <a href="/services" className="text-primary underline">
                        Add services
                      </a>
                    </p>
                  ) : (
                    <div className="grid gap-2 max-h-40 overflow-y-auto rounded-xl border border-border/50 p-3 bg-muted/10">
                      {servicesList.map((svc) => (
                        <label
                          key={svc.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <Checkbox
                            checked={lineItems.some((item) => item.serviceId === svc.id)}
                            onCheckedChange={() => toggleService(svc)}
                          />
                          <span className="text-xs font-semibold text-foreground flex-1">
                            {svc.name}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {formatCurrency(svc.fee, currency)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Configure Selected Services (Line Items detail) */}
                {lineItems.length > 0 && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <Label className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider">
                      Configure Selected Services
                    </Label>
                    <div className="space-y-3 max-h-56 overflow-y-auto rounded-2xl border border-border/50 p-4 bg-muted/5">
                      {lineItems.map((item, idx) => {
                        const itemSubtotal = calculateItemSubtotal(item);
                        return (
                          <div key={item.serviceId} className="p-3 border border-border/40 rounded-xl bg-card space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-foreground truncate">{item.name}</span>
                              <span className="text-xs font-black text-primary">{formatCurrency(itemSubtotal, currency)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Unit Price</label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                                  className="h-8 text-xs rounded-lg px-2"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Qty</label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(idx, "quantity", parseInt(e.target.value, 10) || 1)}
                                  className="h-8 text-xs rounded-lg px-2"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Disc Type</label>
                                <Select
                                  value={item.discountType || "none"}
                                  onValueChange={(val) => updateLineItem(idx, "discountType", val === "none" ? null : val)}
                                >
                                  <SelectTrigger className="h-8 text-xs rounded-lg px-2">
                                    <SelectValue placeholder="None" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="percentage">Percent (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                    <SelectItem value="scholarship">100%</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                  {item.discountType === "scholarship" ? "Ref Code" : "Disc Value / Ref"}
                                </label>
                                <div className="flex gap-1.5">
                                  {item.discountType !== "scholarship" && item.discountType !== null && (
                                    <Input
                                      type="number"
                                      placeholder="Value"
                                      value={item.discountValue}
                                      onChange={(e) => updateLineItem(idx, "discountValue", parseFloat(e.target.value) || 0)}
                                      className="h-8 text-xs rounded-lg px-2 w-16 shrink-0"
                                    />
                                  )}
                                  {item.discountType !== null && (
                                    <Input
                                      type="text"
                                      placeholder="Ref code"
                                      value={item.discountRef}
                                      onChange={(e) => updateLineItem(idx, "discountRef", e.target.value)}
                                      className="h-8 text-xs rounded-lg px-2 flex-1"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="invoice_num"
                      className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider"
                    >
                      Invoice Number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="invoice_num"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. INV-0045"
                      className="rounded-full px-5 h-11 border-border/80"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="amount"
                      className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider"
                    >
                      Amount ({currency}) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="rounded-full px-5 h-11 border-border/80"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="due_date"
                    className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider"
                  >
                    Due Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-full px-5 h-11 border-border/80"
                    required
                  />
                </div>

                {/* Invoice-Level Discount Settings */}
                <div className="border border-border/45 rounded-2xl p-4 bg-muted/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-foreground">
                      Invoice-Level Discount
                    </Label>
                    <Select
                      value={invoiceDiscountType || "none"}
                      onValueChange={(val) => {
                        setInvoiceDiscountType(val === "none" ? null : val as any);
                        if (val === "none") {
                          setInvoiceDiscountValue("");
                          setInvoiceDiscountRef("");
                        }
                      }}
                    >
                      <SelectTrigger className="w-30 h-8 text-xs rounded-lg px-2">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {invoiceDiscountType && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/20 animate-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Discount Value</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={invoiceDiscountValue}
                          onChange={(e) => setInvoiceDiscountValue(e.target.value)}
                          className="h-9 rounded-full px-4 bg-background border-border/80"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Discount Ref</Label>
                        <Input
                          type="text"
                          placeholder="e.g. TOTAL-5"
                          value={invoiceDiscountRef}
                          onChange={(e) => setInvoiceDiscountRef(e.target.value)}
                          className="h-9 rounded-full px-4 bg-background border-border/80"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Summary */}
                {lineItems.length > 0 && (
                  <div className="rounded-2xl bg-muted/20 p-4 space-y-2 border border-border/30 animate-fade-in">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Services Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(itemsSubtotalSum, currency)}</span>
                    </div>
                    {invoiceDiscountType && (
                      <div className="flex justify-between text-xs text-rose-500 font-medium">
                        <span>Invoice Discount ({invoiceDiscountType === "percentage" ? `${invoiceDiscountValue}%` : "Fixed"}):</span>
                        <span>-{formatCurrency(itemsSubtotalSum - finalInvoiceAmount, currency)}</span>
                      </div>
                    )}
                    <div className="border-t border-border/40 my-2 pt-2 flex justify-between text-sm font-black text-foreground">
                      <span>Total Amount:</span>
                      <span className="text-primary">{formatCurrency(finalInvoiceAmount, currency)}</span>
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-4 gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="ghost"
                    shape="pill"
                    onClick={() => setIsCreateOpen(false)}
                    className="font-semibold px-5 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    shape="pill"
                    className="font-semibold shadow-md bg-primary hover:bg-primary/95 text-white px-6 rounded-full"
                  >
                    {creating ? <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" /> : null}
                    Submit &amp; Send Email
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-(--shadow-card) rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Invoiced
              </p>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(totalInvoiced, currency)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-(--shadow-card) rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Collected Revenue
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(collectedInvoiced, currency)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-(--shadow-card) rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Outstanding Invoices
              </p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {formatCurrency(outstandingInvoiced, currency)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table & Searches */}
      <Card className="border-border/60 bg-card/90 backdrop-blur-xl shadow-(--shadow-card) rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border/40 flex flex-wrap gap-4 items-center justify-between bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client or invoice number..."
              className="pl-10 pr-5 rounded-full h-10 border-border/80"
            />
          </div>
          <div className="flex items-center gap-3">
            <DateRangeFilter onChange={setDateRange} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-42.5 rounded-full h-10 border-border/80">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="review_required">Review Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {invoicesLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-semibold">Aligning invoice ledger...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">No invoices found</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Draft billing entries to launch formal records.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-black uppercase text-muted-foreground bg-muted/20">
                  {!isReadOnly && (
                    <th className="py-4.5 pl-6 pr-2 w-12 font-black">
                      <Checkbox
                        checked={
                          filteredInvoices.length > 0 &&
                          selectedIds.length === filteredInvoices.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(filteredInvoices.map((inv) => inv.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                  )}
                  <th className="py-4.5 px-6 font-black">Invoice Code</th>
                  <th className="py-4.5 px-6 font-black">Customer</th>
                  <th className="py-4.5 px-6 font-black">Amount</th>
                  <th className="py-4.5 px-6 font-black">Reconciled Status</th>
                  <th className="py-4.5 px-6 font-black">Due Date</th>
                  <th className="py-4.5 px-6 font-black">Created</th>
                  <th className="py-4.5 px-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-muted/10 transition-colors duration-150 border-b border-border/30 last:border-b-0"
                  >
                    {!isReadOnly && (
                      <td className="py-4.5 pl-6 pr-2">
                        <Checkbox
                          checked={selectedIds.includes(inv.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds((prev) => [...prev, inv.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== inv.id));
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="py-4.5 px-6 font-bold text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground/60" />
                        {inv.invoice_number}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-xs font-medium text-foreground">
                      <div className="font-bold text-foreground">
                        {inv.customers?.name || "Deleted Customer"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-col gap-0.5">
                        {inv.customers?.customer_code && (
                          <span className="text-[10px] font-semibold text-primary font-mono">
                            ID: {inv.customers.customer_code}
                          </span>
                        )}
                        <span>{inv.customers?.email || "—"}</span>
                        {inv.customers?.account_number && (
                          <span className="font-mono text-[9px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit">
                            Acc: {inv.customers.account_number}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-xs text-foreground leading-tight">
                      <div className="font-bold">{formatCurrency(inv.amount, currency)}</div>
                      {Number(inv.subtotal || 0) > Number(inv.amount) && (
                        <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                          Disc: -{formatCurrency(Number(inv.subtotal || 0) - Number(inv.amount), currency)}
                        </div>
                      )}
                    </td>
                    <td
                      className="py-4.5 px-6 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (inv.status === "review_required") {
                          setSelectedInvoice(inv);
                          setIsReviewOpen(true);
                        } else {
                          handleOpenReconcile(inv);
                        }
                      }}
                      title="Click to reconcile / review receipt"
                    >
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-4.5 px-6 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(inv.due_date)}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-xs font-medium text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {/* Primary Action Button */}
                        {inv.status === "review_required" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full px-3 transition-all flex items-center gap-1 shadow-sm animate-pulse"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsReviewOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> Review
                          </Button>
                        )}

                        {inv.status !== "paid" && inv.status !== "review_required" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full px-3 transition-all flex items-center gap-1 shadow-sm"
                            onClick={() => handleOpenReconcile(inv)}
                          >
                            <DollarSign className="h-3.5 w-3.5" /> Reconcile
                          </Button>
                        )}

                        {inv.status === "paid" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full text-xs font-semibold bg-slate-500/5 hover:bg-slate-500/10 text-slate-700 dark:text-slate-300 px-3 transition-all flex items-center gap-1 border border-slate-500/10 shadow-sm"
                            onClick={() => setOutboxInvoice(inv)}
                          >
                            <Mail className="h-3.5 w-3.5" /> Outbox
                          </Button>
                        )}

                        {/* Dropdown Menu for Secondary Actions */}
                        {inv.status !== "paid" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full bg-slate-500/5 hover:bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/10 shadow-sm flex items-center justify-center transition-all"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-card border border-border/80 rounded-2xl shadow-xl p-1.5 z-50"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  const custName = inv.customers?.name || "Customer";
                                  const custPhone = inv.customers?.phone ? inv.customers.phone.replace(/[^0-9]/g, "") : "";
                                  const shareUrl = `${window.location.origin}/invoice/${inv.id}`;
                                  const msg = `Hello ${custName}, your invoice #${inv.invoice_number} is GHS ${inv.amount}. View & confirm payment receipt: ${shareUrl}`;
                                  const waUrl = custPhone ? `https://wa.me/${custPhone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                                  window.open(waUrl, "_blank");
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                              >
                                <span className="text-sm">💬</span> Send via WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setOutboxInvoice(inv)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-accent cursor-pointer transition-colors"
                              >
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Secure Outbox Logs</span>
                              </DropdownMenuItem>

                              {inv.status === "review_required" && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenReconcile(inv)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-accent cursor-pointer transition-colors"
                                >
                                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Manual Reconcile</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ─── Secure Email Outbox Modal ─── */}
      <Dialog open={!!outboxInvoice} onOpenChange={(open) => !open && setOutboxInvoice(null)}>
        <DialogContent className="border border-border/60 bg-card rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500" /> Secure Outbox Logs
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review live transactional logs of notifications pushed for this invoice.
            </DialogDescription>
          </DialogHeader>
          {outboxInvoice && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/10 border border-border/60 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Recipient Name</span>
                  <span className="font-bold">{outboxInvoice.customers?.name || "Customer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Destination Address</span>
                  <span className="font-bold text-primary">
                    {outboxInvoice.customers?.email || "No Email"}
                  </span>
                </div>
                {outboxInvoice.customers?.account_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Account Number</span>
                    <span className="font-bold font-mono text-foreground">
                      {outboxInvoice.customers.account_number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">API Delivery Endpoint</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    https://api.resend.com/emails
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Secure Checkout Link</span>
                  <a
                    href={`${window.location.origin}/invoice/${outboxInvoice.id}`}
                    target="_blank"
                    className="font-bold text-indigo-500 hover:underline flex items-center gap-0.5"
                  >
                    View Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-xs flex gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-500">Email Delivery Status</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Invoice dispatch completed successfully. Secure checkout invitation delivered.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              shape="pill"
              onClick={() => setOutboxInvoice(null)}
              className="rounded-full font-bold px-6"
            >
              Close Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Administrative Receipt Review Modal ─── */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="border border-border/60 bg-card rounded-3xl p-6 sm:p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Receipt Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review the uploaded receipt and customer details before approving or rejecting.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-5 py-4">
              {/* Customer Details Card */}
              <div className="bg-muted/10 border border-border/60 rounded-2xl p-4 text-xs space-y-3">
                <h4 className="font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                  Customer Details
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">Customer Name</span>
                  <span className="font-bold text-foreground">
                    {selectedInvoice.customers?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">Account Number</span>
                  <span className="font-mono font-black text-primary tracking-widest">
                    {selectedInvoice.customers?.account_number || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(selectedInvoice.subtotal || selectedInvoice.amount, currency)}
                  </span>
                </div>
                {Number(selectedInvoice.subtotal || 0) > Number(selectedInvoice.amount) && (
                  <div className="flex justify-between items-center text-rose-500 font-medium">
                    <span>Discount ({selectedInvoice.invoice_discount_type === "percentage" ? `${selectedInvoice.invoice_discount_value}%` : "Fixed"}):</span>
                    <span>-{formatCurrency(Number(selectedInvoice.subtotal || 0) - Number(selectedInvoice.amount), currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground font-bold">Final Amount</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(selectedInvoice.amount, currency)}
                  </span>
                </div>
              </div>

              {/* Uploaded receipt preview */}
              {selectedInvoice.receipt_url && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">
                    Uploaded Receipt Proof
                  </Label>
                  <div className="bg-black/10 border border-border/60 rounded-2xl p-4 flex justify-center max-h-64 overflow-hidden">
                    <img
                      src={selectedInvoice.receipt_url}
                      alt="Uploaded Payment Receipt"
                      className="max-h-56 object-contain rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-0 justify-between">
            <Button
              variant="ghost"
              shape="pill"
              onClick={() => setIsReviewOpen(false)}
              className="font-bold px-5"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold rounded-full px-5"
                disabled={processingAction}
                onClick={() => handleReject(selectedInvoice.id)}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Reject Receipt
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-5"
                disabled={processingAction}
                onClick={() => handleApprove(selectedInvoice.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" /> Approve &amp; Reconcile
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Staff Manual Reconciliation Modal ─── */}
      <Dialog open={isReconcileOpen} onOpenChange={setIsReconcileOpen}>
        <DialogContent className="border border-border/60 bg-card rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Staff Invoice Reconciliation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Manually record payment receipt and verify balance. If the amount exceeds the invoice
              expected value, the system will automatically log an overpayment alert and initiate a
              refund request.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handleManualReconcile} className="space-y-5 py-4">
              <div className="bg-muted/10 border border-border/60 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Invoice Code</span>
                  <span className="font-bold">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Subtotal</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal || selectedInvoice.amount, currency)}</span>
                </div>
                {Number(selectedInvoice.subtotal || 0) > Number(selectedInvoice.amount) && (
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>Discount:</span>
                    <span>-{formatCurrency(Number(selectedInvoice.subtotal || 0) - Number(selectedInvoice.amount), currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/40 pt-2">
                  <span className="text-muted-foreground font-bold">Expected Amount</span>
                  <span className="font-bold text-primary">{formatCurrency(selectedInvoice.amount, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Customer Reference</span>
                  <span className="font-bold">{selectedInvoice.customers?.name || "Customer"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="actual_amount"
                  className="text-xs font-bold text-muted-foreground/80 pl-1 uppercase tracking-wider"
                >
                  Actual Amount Paid ({currency}) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="actual_amount"
                  type="number"
                  step="0.01"
                  value={reconcileAmount}
                  onChange={(e) => setReconcileAmount(e.target.value)}
                  className="rounded-full px-5 h-11 border-border/80"
                  required
                />
              </div>

              {selectedInvoice.receipt_url && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground">
                    Existing Uploaded Receipt
                  </Label>
                  <div className="bg-black/10 border border-border/60 rounded-2xl p-3 flex justify-center max-h-48 overflow-hidden">
                    <img
                      src={selectedInvoice.receipt_url}
                      alt="Uploaded Payment Receipt"
                      className="max-h-40 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  shape="pill"
                  onClick={() => setIsReconcileOpen(false)}
                  className="font-bold px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reconciling}
                  shape="pill"
                  className="bg-primary hover:bg-primary/95 text-white font-bold px-6 rounded-full"
                >
                  {reconciling ? <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" /> : null}
                  Approve &amp; Reconcile
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-border/60 bg-card p-6 sm:p-8 shadow-(--shadow-elegant) max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold text-foreground font-sans">
              Delete Invoice
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete this invoice? This action is permanent and cannot be
              undone. All linked history and payment matching records will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-border/40 gap-2 mt-4">
            <AlertDialogCancel className="px-5 font-semibold text-muted-foreground hover:bg-muted border-0 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="px-6 font-semibold shadow-md bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent className="rounded-3xl border-border/60 bg-card p-6 sm:p-8 shadow-(--shadow-elegant) max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold text-foreground font-sans">
              Delete Selected Invoices
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete the {selectedIds.length} selected invoice
              {selectedIds.length > 1 ? "s" : ""}? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-border/40 gap-2 mt-4">
            <AlertDialogCancel className="px-5 font-semibold text-muted-foreground hover:bg-muted border-0 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onBatchDeleteConfirm}
              className="px-6 font-semibold shadow-md bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
