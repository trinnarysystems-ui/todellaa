/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as XLSX from "xlsx";
import {
  Plus,
  Upload,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Info,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DateRangeFilter, DateRangeFilterValue } from "@/components/date-range-filter";
import { ImportWizard } from "@/components/import-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
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

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — Todellaa" }] }),
  component: CustomersPage,
});

const schema = z.object({
  customer_code: z.string().optional(),
  name: z.string().min(1, "Name required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  account_number: z.string().optional(),
  customer_status: z.string().min(1, "Status required"),
});
type FormValues = z.infer<typeof schema>;

interface Customer {
  id: string;
  customer_code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  service: string | null;
  expected_amount: number;
  due_amount: number;
  status: "paid" | "partial" | "unpaid" | "mismatch";
  account_number: string | null;
  customer_status: string;
  created_by: string | null;
  creator?: { full_name: string | null } | null;
  discount_eligible: boolean;
  discount_type: "percentage" | "fixed" | "scholarship" | null;
  discount_value: number | null;
  discount_ref: string | null;
}

/* ------------------------------------------------------------------ */
/*  Excel Format Preview (matches the Payments screen pattern)        */
/* ------------------------------------------------------------------ */
function CustomerExcelPreview() {
  const cols = ["A", "B", "C", "D"];
  const headers = [
    "customer_code",
    "name",
    "phone",
    "email",
  ];
  const row1 = [
    "CUST-001",
    "John Doe",
    "+233241234567",
    "john@example.com",
  ];
  const row2 = [
    "CUST-002",
    "Jane Smith",
    "+233208765432",
    "",
  ];

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-background shadow-(--shadow-card) font-sans text-sm mt-4">
      <div className="bg-muted/30 border-b border-border/60 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-bold flex items-center gap-2 text-foreground">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          customer_upload_template.xlsx
        </span>
        <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
          Required Columns
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-spacing-0 select-none text-xs text-left">
          <thead>
            <tr className="bg-muted/20 text-center font-bold divide-x divide-border border-b border-border/60">
              <th className="w-10 bg-muted/40 py-2 text-[10px] text-muted-foreground text-center font-mono font-medium"></th>
              {cols.map((col, idx) => (
                <th
                  key={idx}
                  className="py-2 text-[11px] text-muted-foreground font-mono font-black w-24 text-center"
                >
                  {col}
                </th>
              ))}
            </tr>
            <tr className="divide-x divide-border border-b border-border/60 hover:bg-muted/20 bg-blue-500/5">
              <td className="bg-muted/40 text-center font-mono font-medium text-muted-foreground py-2 text-[10px]">
                1
              </td>
              {headers.map((h, idx) => (
                <td
                  key={idx}
                  className="p-2.5 font-bold text-blue-700 dark:text-blue-400 font-mono text-center"
                >
                  {h}
                </td>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr className="divide-x divide-border hover:bg-muted/10">
              <td className="bg-muted/40 text-center font-mono font-medium text-muted-foreground py-2 text-[10px]">
                2
              </td>
              {row1.map((val, idx) => (
                <td key={idx} className="p-2.5 font-mono text-foreground/80 text-center">
                  {val === "" ? (
                    <span className="text-muted-foreground/30 italic">empty</span>
                  ) : (
                    String(val)
                  )}
                </td>
              ))}
            </tr>
            <tr className="divide-x divide-border hover:bg-muted/10">
              <td className="bg-muted/40 text-center font-mono font-medium text-muted-foreground py-2 text-[10px]">
                3
              </td>
              {row2.map((val, idx) => (
                <td key={idx} className="p-2.5 font-mono text-foreground/80 text-center">
                  {val === "" ? (
                    <span className="text-muted-foreground/30 italic">empty</span>
                  ) : (
                    String(val)
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-5 bg-muted/10 border-t border-border/60 space-y-3 text-xs">
        <p className="font-bold text-foreground">Import Specifications & Details:</p>
        <div className="grid gap-3 sm:grid-cols-2 text-[11px] text-muted-foreground">
          <div className="space-y-1.5">
            <p>
              <strong className="text-blue-600 dark:text-blue-400">customer_code</strong> (Col A):
              Optional. Unique identifier you assign (e.g.{" "}
              <code className="bg-muted px-1 py-0.5 rounded">CUST-001</code>).
            </p>
            <p>
              <strong className="text-destructive">name</strong> (Col B):{" "}
              <span className="text-destructive font-bold uppercase tracking-wider text-[10px]">
                Required
              </span>
              . Customer full name.
            </p>
            <p>
              <strong>account_number</strong> (Col E): Optional banking identification field.
            </p>
          </div>
          <div className="space-y-1.5">
            <p>
              <strong>phone, email</strong>: Optional text fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateCode(existingCodes: (string | null)[]) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codeSet = new Set(existingCodes.filter(Boolean));
  let code = "";
  do {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
      "",
    );
  } while (codeSet.has(code));
  return code;
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
function CustomersPage() {
  const { user, organization, role } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const isReadOnly = role === "viewer";
  const [open, setOpen] = useState(false);
  const [formatPreviewOpen, setFormatPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const currency = organization?.currency ?? "GHS";

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardHeaders, setWizardHeaders] = useState<string[]>([]);
  const [wizardRows, setWizardRows] = useState<any[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  // States for Phone Country Code selector
  const [phoneCode, setPhoneCode] = useState("+233");
  const [localPhone, setLocalPhone] = useState("");

  // States for Duplicate Detection
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<FormValues | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>({
    startDate: null,
    endDate: null,
  });

  // Fetch services for dropdown
  const { data: servicesList = [] } = useQuery({
    queryKey: ["services-list", organization?.id],
    enabled: !!organization?.id,
    queryFn: async () => {
      const { data } = await supabase.from("services").select("id, name, fee").order("name");
      return data ?? [];
    },
  });

  const onBatchDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from("customers").delete().in("id", selectedIds);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Successfully deleted ${selectedIds.length} customers!`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
    setBatchDeleteOpen(false);
  };

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", organization?.id, dateRange],
    enabled: !!organization?.id,
    queryFn: async () => {
      let query = (supabase as any)
        .from("customers")
        .select("*, creator:profiles!created_by(full_name)");

      if (dateRange.startDate) {
        query = query.gte("created_at", dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte("created_at", dateRange.endDate);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  const filtered = (customers ?? []).filter((c) =>
    [
      c.name,
      c.phone,
      c.email,
      c.service,
      c.customer_code,
      c.account_number,
      c.customer_status,
      c.creator?.full_name,
    ].some((f) => f?.toLowerCase().includes(search.toLowerCase())),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_code: "",
      name: "",
      phone: "",
      email: "",
      account_number: "",
      customer_status: "Active",
    },
  });

  const parsePhone = (fullPhone: string | null) => {
    if (!fullPhone) return { code: "+233", local: "" };
    if (fullPhone.startsWith("+233")) return { code: "+233", local: fullPhone.slice(4) };
    if (fullPhone.startsWith("+234")) return { code: "+234", local: fullPhone.slice(4) };
    if (fullPhone.startsWith("+44")) return { code: "+44", local: fullPhone.slice(3) };
    if (fullPhone.startsWith("+1")) return { code: "+1", local: fullPhone.slice(2) };
    if (fullPhone.startsWith("+91")) return { code: "+91", local: fullPhone.slice(3) };
    if (fullPhone.startsWith("+49")) return { code: "+49", local: fullPhone.slice(3) };
    if (fullPhone.startsWith("+33")) return { code: "+33", local: fullPhone.slice(3) };
    return { code: "+233", local: fullPhone };
  };

  const openCreate = () => {
    setEditing(null);
    const existingCodes = (customers ?? []).map((c) => c.customer_code);
    const autoCode = generateCode(existingCodes);
    form.reset({
      customer_code: autoCode,
      name: "",
      phone: "",
      email: "",
      account_number: "",
      customer_status: "Active",
    });
    setPhoneCode("+233");
    setLocalPhone("");
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    const existingCodes = (customers ?? []).map((c) => c.customer_code);
    form.reset({
      customer_code: c.customer_code || generateCode(existingCodes),
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      account_number: c.account_number ?? "",
      customer_status: c.customer_status || "Active",
    });
    const parsed = parsePhone(c.phone);
    setPhoneCode(parsed.code);
    setLocalPhone(parsed.local);
    setOpen(true);
  };


  const onSubmit = async (values: FormValues) => {
    if (!organization) return;

    // Concatenate phone number
    const finalPhone = localPhone ? `${phoneCode}${localPhone}` : "";
    const updatedValues = { ...values, phone: finalPhone };

    if (!editing) {
      // Check for duplicates
      const nameMatch = (customers ?? []).find(
        (c) => c.name.toLowerCase().trim() === values.name.toLowerCase().trim(),
      );
      const emailMatch = values.email
        ? (customers ?? []).find(
            (c) => c.email?.toLowerCase().trim() === values.email?.toLowerCase().trim(),
          )
        : null;
      const phoneMatch = finalPhone ? (customers ?? []).find((c) => c.phone === finalPhone) : null;
      const codeMatch = values.customer_code
        ? (customers ?? []).find(
            (c) =>
              c.customer_code?.toLowerCase().trim() === values.customer_code?.toLowerCase().trim(),
          )
        : null;

      const matched = nameMatch || emailMatch || phoneMatch || codeMatch;
      if (matched) {
        setDuplicateCustomer(matched);
        setPendingSubmitValues(updatedValues);
        return; // Pause submission, show dialog
      }
    }

    await proceedSave(updatedValues);
  };

  const proceedSave = async (values: FormValues) => {
    if (!organization) return;

    let code = values.customer_code?.trim() || null;
    if (!code && !editing) {
      const existingCodes = (customers ?? []).map((c) => c.customer_code);
      code = generateCode(existingCodes);
    }
    if (!code && editing && !editing.customer_code) {
      const existingCodes = (customers ?? []).map((c) => c.customer_code);
      code = generateCode(existingCodes);
    }

    const payload = {
      customer_code: code,
      name: values.name.trim(),
      phone: values.phone || null,
      email: values.email || null,
      account_number: values.account_number || null,
      organization_id: organization.id,
      customer_status: values.customer_status,
      created_by: editing ? editing.created_by : user?.id,
    };

    if (editing) {
      const { error } = await supabase.from("customers").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);

      // Log changes to customer_change_log
      const changes: any[] = [];
      const fieldsToTrack: ("name" | "phone" | "email" | "customer_code" | "account_number" | "customer_status")[] = [
        "name",
        "phone",
        "email",
        "customer_code",
        "account_number",
        "customer_status",
      ];
      
      fieldsToTrack.forEach((field) => {
        const oldVal = editing[field as keyof Customer] ?? "";
        const newVal = payload[field as keyof typeof payload] ?? "";
        if (String(oldVal).trim() !== String(newVal).trim()) {
          changes.push({
            organization_id: organization.id,
            customer_id: editing.id,
            changed_by: user?.id,
            field_name: field,
            old_value: oldVal ? String(oldVal) : null,
            new_value: newVal ? String(newVal) : null,
          });
        }
      });

      if (changes.length > 0) {
        await (supabase as any).from("customer_change_log").insert(changes);
      }

      toast.success("Customer updated");
    } else {
      const { error } = await supabase.from("customers").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Customer added");
    }
    setOpen(false);
    setDuplicateCustomer(null);
    setPendingSubmitValues(null);
    qc.invalidateQueries({ queryKey: ["customers"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("customers").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Customer deleted");
    setDeleteId(null);
    qc.invalidateQueries({ queryKey: ["customers"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const CUSTOMER_FIELDS = [
    { key: "customer_code", label: "Customer Code", required: false, type: "string" as const },
    { key: "name", label: "Full Name", required: true, type: "string" as const },
    { key: "phone", label: "Phone Number", required: false, type: "string" as const },
    { key: "email", label: "Email Address", required: false, type: "email" as const },
  ];

  /* ---- Bulk Excel Import ---- */
  const onImportFile = (file: File) => {
    if (!organization) return;
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension !== "xlsx" && fileExtension !== "xls" && fileExtension !== "csv") {
      return toast.error("Only Excel (.xlsx, .xls) and CSV (.csv) files are supported.");
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (parsedData.length === 0) {
          return toast.error("The spreadsheet is empty.");
        }

        const headers = Object.keys(parsedData[0]);
        setWizardHeaders(headers);
        setWizardRows(parsedData);
        setWizardOpen(true);
      } catch (err: any) {
        toast.error(`File parsing failed: ${err.message}`);
      }
    };
    reader.onerror = () => toast.error("Error reading file");
    reader.readAsArrayBuffer(file);
  };

  const onWizardImport = async (mappedRows: any[]) => {
    if (!organization) return;

    // Gather existing codes to auto-generate for rows without one
    const existingCodes = (customers ?? []).map((c) => c.customer_code);
    const rows = mappedRows.map((r) => {
      return {
        organization_id: organization.id,
        customer_code: (r.customer_code || null) as string | null,
        name: String(r.name ?? "").trim(),
        phone: r.phone || null,
        email: r.email || null,
        account_number: r.account_number || null,
        expected_amount: 0,
        due_amount: 0,
        status: "unpaid" as const,
        customer_status: "Active",
        created_by: user?.id || null,
      };
    });

    const { error } = await supabase.from("customers").insert(rows);
    if (error) throw new Error(error.message);

    qc.invalidateQueries({ queryKey: ["customers"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const canManageDiscounts = role === "super_admin" || role === "admin" || role === "manager";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track clients you collect payments from.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/services">
            <Button
              variant="outline"
              shape="pill"
              className="h-9 text-xs font-semibold border-border/80 text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </Button>
          </Link>
          {selectedIds.length > 0 && !isReadOnly && (
            <Button
              variant="destructive"
              shape="pill"
              className="h-9 text-xs font-bold gap-2 animate-fade-in bg-rose-600 hover:bg-rose-700 text-white shadow-md"
              onClick={() => setBatchDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportFile(file);
              }
              e.target.value = "";
            }}
          />
          <Dialog open={formatPreviewOpen} onOpenChange={setFormatPreviewOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                shape="pill"
                className="h-9 text-xs font-semibold text-muted-foreground border-border/80 hover:text-foreground"
              >
                <Info className="h-4 w-4 text-primary" /> View Excel Format
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-border/60 bg-card max-w-2xl sm:max-w-3xl p-6 sm:p-8 shadow-(--shadow-elegant)">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-foreground font-sans">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customer Excel Import Guide
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Bulk-add dozens of customers at once. Format your spreadsheets with the exact
                  headers shown below.
                </p>
              </DialogHeader>
              <CustomerExcelPreview />
            </DialogContent>
          </Dialog>

          {!isReadOnly && (
            <>
              <Button
                variant="outline"
                shape="pill"
                className="h-9 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Import Excel
              </Button>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openCreate}
                    shape="pill"
                    className="font-semibold shadow-md bg-primary hover:bg-primary/95 text-white gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-border/60 bg-card max-w-md p-6 sm:p-8 shadow-(--shadow-elegant) max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4 border-b border-border/40">
                    <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground font-sans">
                      {editing ? "Modify Customer Details" : "Register New Customer"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
                        Customer ID
                      </Label>
                      <Input
                        className="rounded-full px-5 h-10 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/85 bg-background text-foreground transition-all"
                        placeholder="CUST-001 (optional)"
                        {...form.register("customer_code")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
                        Full Name
                      </Label>
                      <Input
                        className="rounded-full px-5 h-10 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/85 bg-background text-foreground transition-all"
                        placeholder="John Doe"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name?.message && (
                        <p className="text-xs text-destructive pl-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
                        Customer Status
                      </Label>
                      <Select
                        value={form.watch("customer_status") || "Active"}
                        onValueChange={(val) => form.setValue("customer_status", val)}
                      >
                        <SelectTrigger className="rounded-full px-5 h-10 border-border/80 bg-background text-foreground transition-all">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Deferred">Deferred</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
                        Phone Number
                      </Label>
                      <div className="flex gap-2">
                        <Select value={phoneCode} onValueChange={setPhoneCode}>
                          <SelectTrigger className="w-30 rounded-full px-4 h-10 border-border/80 bg-background text-foreground transition-all shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+233">+233 (GH)</SelectItem>
                            <SelectItem value="+234">+234 (NG)</SelectItem>
                            <SelectItem value="+44">+44 (UK)</SelectItem>
                            <SelectItem value="+1">+1 (US/CA)</SelectItem>
                            <SelectItem value="+91">+91 (IN)</SelectItem>
                            <SelectItem value="+49">+49 (DE)</SelectItem>
                            <SelectItem value="+33">+33 (FR)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          className="flex-1 rounded-full px-5 h-10 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/85 bg-background text-foreground transition-all"
                          placeholder="8012345678"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
                        Email Address (Optional)
                      </Label>
                      <Input
                        type="email"
                        className="rounded-full px-5 h-10 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/85 bg-background text-foreground transition-all"
                        placeholder="john@example.com (Optional)"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email?.message && (
                        <p className="text-xs text-destructive pl-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Decoupled services/discounts fields removed */}

                    <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="ghost"
                        shape="pill"
                        onClick={() => setOpen(false)}
                        className="px-5 font-semibold text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        shape="pill"
                        className="px-6 font-semibold shadow-md bg-primary hover:bg-primary/95 text-white"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {editing ? "Save Changes" : "Confirm Addition"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Card className="border-border/60 bg-card shadow-(--shadow-card) rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1 min-w-70">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-11 pr-5 h-11 rounded-full border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/85 bg-background text-foreground transition-all"
                placeholder="Search customers by name, status, ID or added by..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DateRangeFilter onChange={setDateRange} />
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState search={search} onAdd={openCreate} isReadOnly={isReadOnly} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    {!isReadOnly && (
                      <TableHead className="w-12 py-4 pl-6">
                        <Checkbox
                          checked={filtered.length > 0 && selectedIds.length === filtered.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds(filtered.map((c) => c.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </TableHead>
                    )}
                    <TableHead className="font-bold text-foreground py-4 pl-2">
                      Client Info
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-4">Customer ID</TableHead>
                    <TableHead className="font-bold text-foreground py-4">Email</TableHead>
                    {!isReadOnly && (
                      <TableHead className="font-bold text-foreground py-4 text-right pr-6">
                        Management
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const isPaid = c.status === "paid";
                    const isPartial = c.status === "partial";

                    let badgeClass =
                      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                    if (isPaid)
                      badgeClass =
                        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
                    if (isPartial)
                      badgeClass =
                        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20";

                    let statusBadgeClass =
                      "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
                    if (c.customer_status === "Deferred") {
                      statusBadgeClass =
                        "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20";
                    } else if (c.customer_status === "Completed") {
                      statusBadgeClass =
                        "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20";
                    }

                    const initials = c.name
                      ? c.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "C";

                    return (
                      <TableRow
                        key={c.id}
                        className="hover:bg-muted/20 transition-colors duration-150 border-b border-border/30 last:border-b-0"
                      >
                        {!isReadOnly && (
                          <TableCell className="py-4 pl-6">
                            <Checkbox
                              checked={selectedIds.includes(c.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedIds((prev) => [...prev, c.id]);
                                } else {
                                  setSelectedIds((prev) => prev.filter((id) => id !== c.id));
                                }
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell className="py-4 pl-2 font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shrink-0">
                              {initials}
                            </div>
                            <div className="leading-tight">
                              <p className="font-bold text-foreground tracking-tight">{c.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {c.email ?? "No email profile"}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {c.phone || "No phone number"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {c.customer_code ? (
                            <span className="font-mono font-bold text-xs bg-primary/5 text-primary px-2.5 py-1 rounded-md border border-primary/15 tracking-wide">
                              {c.customer_code}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50 italic">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-xs text-muted-foreground">
                          {c.email ? (
                            <span className="font-mono">{c.email}</span>
                          ) : (
                            <span className="italic text-muted-foreground/50">No email</span>
                          )}
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell className="py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted text-primary border border-border/50 transition-colors"
                                onClick={() => openEdit(c)}
                                title="Edit customer"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-full bg-destructive/5 hover:bg-destructive/10 text-destructive border border-destructive/10 transition-colors"
                                onClick={() => setDeleteId(c.id)}
                                title="Delete customer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-border/60 bg-card p-6 sm:p-8 shadow-(--shadow-elegant) max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold text-foreground font-sans">
              Delete Customer
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete this customer? This action is permanent and cannot be
              undone. All linked payments and history for this customer will no longer be matched.
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
              Delete Selected Customers
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete the {selectedIds.length} selected customer
              {selectedIds.length > 1 ? "s" : ""}? This action is permanent and cannot be undone.
              All linked payments and history will no longer be matched.
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

      <AlertDialog
        open={!!duplicateCustomer}
        onOpenChange={(open) => !open && setDuplicateCustomer(null)}
      >
        <AlertDialogContent className="rounded-3xl border-border/60 bg-card p-6 sm:p-8 shadow-(--shadow-elegant) max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold text-foreground font-sans">
              Possible Duplicate Found
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              A customer named{" "}
              <strong className="text-foreground">{duplicateCustomer?.name}</strong> with email{" "}
              <strong className="text-foreground">{duplicateCustomer?.email || "N/A"}</strong> and
              phone <strong className="text-foreground">{duplicateCustomer?.phone || "N/A"}</strong>{" "}
              already exists. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-border/40 gap-2 mt-4 flex flex-col sm:flex-row justify-end">
            <AlertDialogCancel className="px-5 font-semibold text-muted-foreground hover:bg-muted border-0 bg-transparent sm:mr-auto">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              shape="pill"
              className="px-5 font-semibold border-border/80 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (duplicateCustomer) {
                  openEdit(duplicateCustomer);
                  setDuplicateCustomer(null);
                  setPendingSubmitValues(null);
                }
              }}
            >
              View Existing Customer
            </Button>
            <AlertDialogAction
              onClick={() => {
                if (pendingSubmitValues) {
                  proceedSave(pendingSubmitValues);
                }
              }}
              className="px-6 font-semibold shadow-md bg-primary hover:bg-primary/95 text-white border-0"
            >
              Ignore & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Customers"
        headers={wizardHeaders}
        rawData={wizardRows}
        fields={CUSTOMER_FIELDS}
        onImport={onWizardImport}
      />
    </div>
  );
}

function EmptyState({
  search,
  onAdd,
  isReadOnly,
}: {
  search: string;
  onAdd: () => void;
  isReadOnly?: boolean;
}) {
  return (
    <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/10">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground font-sans">
        No customers {search ? "match your search" : "yet"}
      </h3>
      <p className="mt-1.5 max-w-sm mx-auto text-sm text-muted-foreground">
        {search
          ? "Try refining your keywords or search spelling."
          : "Create your first customer profile to start matching payments."}
      </p>
      {!search && !isReadOnly && (
        <Button
          onClick={onAdd}
          shape="pill"
          className="mt-6 font-semibold shadow-md bg-primary hover:bg-primary/95 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      )}
    </div>
  );
}
