/**
 * Reconciliation Engine
 * 
 * Shared logic for matching Paystack, Bank Transfer, and Mobile Money
 * transactions to customers and invoices, then creating payment records.
 */

import { supabaseAdmin } from "../config/supabase.js";

interface ReconcileInput {
  organization_id: string;
  amount: number;
  reference?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  transaction_id?: string | null;
  payment_date?: string;
  source: string;
  channel?: string | null;
  bank_name?: string | null;
  mobile_number?: string | null;
  paid_by_name?: string | null;
  paid_by_phone?: string | null;
  relationship?: string | null;
  currency?: string;
  customer_id?: string | null;
  invoice_id?: string | null;
}

interface ReconcileResult {
  status: "matched" | "partial" | "overpaid" | "duplicate" | "unmatched";
  payment_id?: string;
  customer_id?: string | null;
  invoice_id?: string | null;
  message: string;
  confidence_score?: number;
  verification_status?: string;
}

/**
 * Check if a transaction is a duplicate by reference, transaction_id,
 * or the amount + payment_date + customer combination.
 */
async function checkDuplicate(
  orgId: string,
  amount: number,
  paymentDate: string,
  customerId: string | null,
  customerPhone: string | null,
  reference?: string | null,
  transactionId?: string | null
): Promise<boolean> {
  if (reference) {
    const { data } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("organization_id", orgId)
      .eq("reference", reference)
      .limit(1);
    if (data && data.length > 0) return true;
  }
  
  if (transactionId) {
    const { data } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("organization_id", orgId)
      .eq("transaction_id", transactionId)
      .limit(1);
    if (data && data.length > 0) return true;
  }

  // Heuristic check: Same customer, same amount, same date
  if (customerId && amount && paymentDate) {
    const { data } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("organization_id", orgId)
      .eq("customer_id", customerId)
      .eq("amount_paid", amount)
      .eq("payment_date", paymentDate)
      .limit(1);
    if (data && data.length > 0) return true;
  }

  return false;
}

/**
 * Core reconciliation function.
 * Takes a single transaction input, calculates a matching score, and creates a linked payment record.
 */
export async function reconcileTransaction(
  input: ReconcileInput,
  prefetched?: {
    orgCurrency?: string;
    customers?: any[];
    invoices?: any[];
  }
): Promise<ReconcileResult> {
  const orgId = input.organization_id;

  // Step 1: Fetch organization currency to ensure currency-aware matching
  let orgCurrency: string;
  if (prefetched?.orgCurrency) {
    orgCurrency = prefetched.orgCurrency;
  } else {
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("currency")
      .eq("id", orgId)
      .single();
    orgCurrency = org?.currency || "GHS";
  }

  const currencyMatch = !input.currency || input.currency.toUpperCase() === orgCurrency.toUpperCase();
  const currencyPenalty = currencyMatch ? 0 : -30;

  // Step 2: Fetch candidate customers and invoices in this organization if not prefetched
  let allCustomers = prefetched?.customers;
  if (!allCustomers) {
    const { data } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone, email, customer_code, expected_amount, due_amount")
      .eq("organization_id", orgId);
    allCustomers = data || [];
  }

  let allInvoices = prefetched?.invoices;
  if (!allInvoices) {
    const { data } = await supabaseAdmin
      .from("invoices")
      .select("id, customer_id, invoice_number, amount, status")
      .eq("organization_id", orgId)
      .neq("status", "paid");
    allInvoices = data || [];
  }

  // Step 3: Match heuristics and scoring
  let bestCustomer: any = null;
  let bestInvoice: any = null;
  let maxScore = 0;

  // If invoice_id is explicitly provided, fetch/select it directly
  if (input.invoice_id) {
    const { data: inv } = await supabaseAdmin
      .from("invoices")
      .select("id, customer_id, invoice_number, amount, status, customers(id, name, phone, email, customer_code, expected_amount, due_amount)")
      .eq("id", input.invoice_id)
      .single();
    if (inv) {
      bestInvoice = {
        id: inv.id,
        customer_id: inv.customer_id,
        invoice_number: inv.invoice_number,
        amount: inv.amount,
        status: inv.status
      };
      if (inv.customers) {
        bestCustomer = inv.customers;
      }
      maxScore = 100;
    }
  }

  // If not resolved by explicit invoice ID, run heuristic matching
  if (!bestInvoice) {
    const cleanPhone = (p?: string | null) => p ? p.replace(/\D/g, "") : "";
    const cleanName = (n?: string | null) => n ? n.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

    const refClean = input.reference ? input.reference.trim().toUpperCase() : "";
    const inputPhone = cleanPhone(input.customer_phone || input.mobile_number || input.paid_by_phone);
    const inputEmail = input.customer_email ? input.customer_email.trim().toLowerCase() : "";
    const inputName = cleanName(input.customer_name || input.paid_by_name);

    for (const c of (allCustomers || [])) {
      let score = 0;
      let matchedInvoice: any = null;

      // A. Reference / Invoice matching
      if (c.customer_code && refClean === c.customer_code.trim().toUpperCase()) {
        score += 50;
      }

      const customerInvoices = (allInvoices || []).filter(inv => inv.customer_id === c.id);
      const invMatch = customerInvoices.find(inv => inv.invoice_number.trim().toUpperCase() === refClean);
      if (invMatch) {
        score += 50;
        matchedInvoice = invMatch;
      }

      // B. Phone Match (+25 points)
      const cPhone = cleanPhone(c.phone);
      if (cPhone && inputPhone && (cPhone.endsWith(inputPhone) || inputPhone.endsWith(cPhone))) {
        score += 25;
      }

      // C. Email Match (+25 points)
      const cEmail = c.email ? c.email.trim().toLowerCase() : "";
      if (cEmail && inputEmail && cEmail === inputEmail) {
        score += 25;
      }

      // D. Fuzzy Name Match (+10 points)
      const cName = cleanName(c.name);
      if (cName && inputName && (cName.includes(inputName) || inputName.includes(cName))) {
        score += 10;
      }

      // E. Amount Match (+15 points)
      if (Math.abs(Number(c.due_amount) - input.amount) < 0.01 || Math.abs(Number(c.expected_amount) - input.amount) < 0.01) {
        score += 15;
      }
      const amtMatch = customerInvoices.find(inv => Math.abs(Number(inv.amount) - input.amount) < 0.01);
      if (amtMatch) {
        score += 15;
        if (!matchedInvoice) {
          matchedInvoice = amtMatch;
        }
      }

      // F. Currency Penalty
      score += currencyPenalty;

      // G. Explicit customer ID match (+60 points to guarantee auto-verify threshold)
      if (input.customer_id && c.id === input.customer_id) {
        score += 60;
      }

      if (score > maxScore) {
        maxScore = score;
        bestCustomer = c;
        bestInvoice = matchedInvoice;
      }
    }
  }

  let confidenceScore = Math.max(0, Math.min(100, maxScore));
  let customerId = bestCustomer?.id || null;
  let invoiceId = bestInvoice?.id || null;
  let aiAuditResult: any = null;

  // Step 3.5: AI Auditing for ambiguous matching cases (heuristic score between 20 and 49)
  // Skip AI if we are already auto-verified (score >= 50) or if the customer ID was explicitly provided by the user.
  if (customerId && confidenceScore >= 20 && confidenceScore < 50 && !input.customer_id) {
    try {
      console.log(`[Reconciliation] Triggering AI match audit for customer "${bestCustomer.name}" (heuristic score: ${confidenceScore})`);
      const { auditReconciliationWithAI } = await import("./ai.js");
      aiAuditResult = await auditReconciliationWithAI(
        {
          paid_by_name: input.paid_by_name || input.customer_name,
          paid_by_phone: input.paid_by_phone || input.customer_phone || input.mobile_number,
          reference: input.reference,
          amount_paid: input.amount,
        },
        bestCustomer,
        confidenceScore
      );
      
      console.log(`[Reconciliation] AI Match Audit Decision: ${aiAuditResult.matchDecision} (AI Score: ${aiAuditResult.confidenceScore})`);
      confidenceScore = aiAuditResult.confidenceScore;
    } catch (e: any) {
      console.warn("[Reconciliation] AI matching audit failed:", e.message);
    }
  }

  // Step 4: Check duplicates
  const isDuplicate = await checkDuplicate(
    orgId,
    input.amount,
    input.payment_date || new Date().toISOString().slice(0, 10),
    customerId,
    input.customer_phone || input.mobile_number || null,
    input.reference,
    input.transaction_id
  );

  if (isDuplicate) {
    return {
      status: "duplicate",
      message: `Duplicate transaction detected (ref: ${input.reference || input.transaction_id}).`,
    };
  }

  // Step 5: Determine verification status based on threshold (50 points)
  // If matched and score >= 50, it auto-verifies. Else, it stays pending review.
  let verificationStatus = "pending";
  if (customerId) {
    if (aiAuditResult) {
      verificationStatus = aiAuditResult.matchDecision === "approve" ? "auto_verified" : "pending";
    } else {
      verificationStatus = confidenceScore >= 50 ? "auto_verified" : "pending";
    }
  }

  // Step 6: Determine outcome status
  let outcome: "matched" | "partial" | "overpaid" | "unmatched" = "unmatched";

  if (customerId) {
    // Determine status relative to specific invoice expected amount, or fall back to customer overall expectations
    const expected = bestInvoice ? Number(bestInvoice.amount || 0) : Number(bestCustomer.expected_amount || 0);
    if (input.amount >= expected && expected > 0) {
      outcome = input.amount > expected ? "overpaid" : "matched";
    } else if (input.amount > 0 && input.amount < expected) {
      outcome = "partial";
    } else {
      outcome = "matched";
    }
  }

  // Determine payment status column value
  let paymentStatus: string = "paid";
  if (outcome === "partial") paymentStatus = "partial";
  else if (outcome === "overpaid") paymentStatus = "mismatch";
  else if (outcome === "unmatched") paymentStatus = "paid";

  // Build Audit/Reconciliation Notes
  let notes = customerId
    ? `Reconciled via ${input.source}. Match score: ${confidenceScore}. Status: ${outcome}. Verification: ${verificationStatus}.`
    : `Unmatched transaction from ${input.source}. Verification: pending staff match.`;
  
  if (aiAuditResult?.reason) {
    notes += ` [AI Audit: ${aiAuditResult.reason}]`;
  }

  // Step 7: Insert payment record
  const { data: payment, error: payErr } = await supabaseAdmin
    .from("payments")
    .insert({
      organization_id: orgId,
      customer_id: customerId,
      invoice_id: invoiceId,
      amount_paid: input.amount,
      payment_method: input.channel || null,
      reference: input.reference || null,
      payment_date: input.payment_date || new Date().toISOString().slice(0, 10),
      notes,
      status: paymentStatus,
      source: input.source,
      transaction_id: input.transaction_id || null,
      currency: input.currency || "GHS",
      bank_name: input.bank_name || null,
      mobile_number: input.mobile_number || null,
      paid_by_name: input.paid_by_name || null,
      paid_by_phone: input.paid_by_phone || null,
      relationship: input.relationship || null,
      confidence_score: confidenceScore,
      verification_status: verificationStatus,
    })
    .select()
    .single();

  if (payErr || !payment) {
    console.error("[Reconciliation] Payment insert error:", payErr?.message);
    return { status: "unmatched", message: `Failed to insert payment: ${payErr?.message}` };
  }

  // Step 7.5: Run fraud anomaly checks asynchronously in the background to avoid blocking HTTP imports
  if (customerId && verificationStatus === "auto_verified") {
    runBackgroundFraudDetection(
      payment.id,
      customerId,
      orgId,
      invoiceId,
      input.amount,
      input.channel || null,
      input.source,
      input.bank_name || null,
      input.reference || null,
      (input.paid_by_name || input.customer_name) || null
    ).catch((err) => {
      console.error("[Reconciliation] Background fraud detection trigger failed:", err.message);
    });
  }

  // Step 8: If overpayment and verified, create alert & refund request
  if (outcome === "overpaid" && customerId && verificationStatus === "auto_verified") {
    const excess = input.amount - Number(bestCustomer.expected_amount);

    await supabaseAdmin.from("alerts").insert({
      organization_id: orgId,
      invoice_id: invoiceId,
      payment_id: payment.id,
      type: "overpayment",
      amount: excess,
      message: `Overpayment of ${excess.toLocaleString()} detected for ${bestCustomer.name}. Paid: ${input.amount.toLocaleString()}, Expected: ${bestCustomer.expected_amount.toLocaleString()}.`,
    });

    await supabaseAdmin.from("refunds").insert({
      organization_id: orgId,
      customer_id: customerId,
      payment_id: payment.id,
      invoice_id: invoiceId,
      refund_amount: excess,
      reason: `Automated refund candidate for overpayment via ${input.source}.`,
      status: "pending",
    });
  }

  // Step 9: If verified & matched invoice, update invoice status
  if (invoiceId && verificationStatus === "auto_verified") {
    const invoiceStatus = outcome === "overpaid" ? "overpaid" : outcome === "partial" ? "partial" : "paid";
    await supabaseAdmin
      .from("invoices")
      .update({ status: invoiceStatus })
      .eq("id", invoiceId);
  }

  // Step 10: Audit Log
  await supabaseAdmin.from("audit_logs").insert({
    organization_id: orgId,
    action_type: "payment_reconciled",
    action_description: `Payment of ${input.amount.toLocaleString()} processed from ${input.source}. Score: ${confidenceScore}. Status: ${outcome}. Verification: ${verificationStatus}.`,
    related_record_id: payment.id,
  });

  return {
    status: outcome,
    payment_id: payment.id,
    customer_id: customerId,
    invoice_id: invoiceId,
    message: `Transaction processed: ${outcome}. Score: ${confidenceScore}. Verification: ${verificationStatus}.`,
    confidence_score: confidenceScore,
    verification_status: verificationStatus,
  };
}

/**
 * Background worker task for running fraud and anomaly checks.
 */
async function runBackgroundFraudDetection(
  paymentId: string,
  customerId: string,
  orgId: string,
  invoiceId: string | null,
  amount: number,
  channel: string | null,
  source: string,
  bankName: string | null,
  reference: string | null,
  paidByName: string | null
) {
  try {
    const { detectPaymentAnomaly } = await import("./fraud-detection.js");
    const fraudResult = await detectPaymentAnomaly(
      {
        amount_paid: amount,
        payment_method: channel || "bank",
        source,
        bank_name: bankName,
        reference,
        paid_by_name: paidByName,
      },
      customerId
    );

    if (fraudResult.isAnomalous) {
      const fraudReasons = fraudResult.reasons;

      // Get current notes to append risk warning
      const { data: currentPayment } = await supabaseAdmin
        .from("payments")
        .select("notes")
        .eq("id", paymentId)
        .single();

      let updatedNotes = currentPayment?.notes || "";
      updatedNotes += ` [Risk Alert: ${fraudReasons.join("; ")}]`;

      // Update payment to demote verification_status to pending
      await supabaseAdmin
        .from("payments")
        .update({
          verification_status: "pending",
          notes: updatedNotes,
        })
        .eq("id", paymentId);

      // Insert security fraud warning alert
      await supabaseAdmin.from("alerts").insert({
        organization_id: orgId,
        invoice_id: invoiceId,
        payment_id: paymentId,
        type: "fraud_warning",
        amount,
        message: `Suspicious payment flags: ${fraudReasons.join(". ")}`,
      });

      console.warn(`[Reconciliation-Background] Flagged high risk anomaly for payment ${paymentId}. Demoted to pending. Reasons: ${fraudReasons.join("; ")}`);
    }
  } catch (err: any) {
    console.error("[Reconciliation-Background] Fraud detection background task failed:", err.message);
  }
}

/**
 * Batch reconciliation for CSV/Excel imports.
 * Uses controlled concurrency (5 at a time) to prevent DB deadlocks
 * while still being much faster than sequential processing.
 */
export async function reconcileBatch(orgId: string, rows: ReconcileInput[]): Promise<{
  total: number;
  matched: number;
  partial: number;
  overpaid: number;
  duplicates: number;
  unmatched: number;
  results: ReconcileResult[];
}> {
  const results: ReconcileResult[] = [];
  let matched = 0, partial = 0, overpaid = 0, duplicates = 0, unmatched = 0;

  // Pre-fetch shared data once for the entire batch (3 queries instead of N×3)
  const [orgResult, customersResult, invoicesResult] = await Promise.all([
    supabaseAdmin.from("organizations").select("currency").eq("id", orgId).single(),
    supabaseAdmin.from("customers").select("id, name, phone, email, customer_code, expected_amount, due_amount").eq("organization_id", orgId),
    supabaseAdmin.from("invoices").select("id, customer_id, invoice_number, amount, status").eq("organization_id", orgId).neq("status", "paid"),
  ]);

  const prefetched = {
    orgCurrency: orgResult.data?.currency || "GHS",
    customers: customersResult.data || [],
    invoices: invoicesResult.data || [],
  };

  console.log(`[Reconciliation] Pre-fetched ${prefetched.customers.length} customers and ${prefetched.invoices.length} invoices for batch of ${rows.length}`);

  // Process in chunks of 5 to avoid PostgreSQL deadlocks from concurrent
  // row-level locks on the same customer records (trigger: recalculate_customer_reconciliation)
  const CHUNK_SIZE = 5;
  const chunks: ReconcileInput[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((row) =>
        reconcileTransaction(
          { ...row, organization_id: orgId },
          prefetched
        )
      )
    );

    for (const result of chunkResults) {
      results.push(result);
      switch (result.status) {
        case "matched": matched++; break;
        case "partial": partial++; break;
        case "overpaid": overpaid++; break;
        case "duplicate": duplicates++; break;
        case "unmatched": unmatched++; break;
      }
    }
  }

  console.log(`[Reconciliation] Batch complete — matched: ${matched}, partial: ${partial}, overpaid: ${overpaid}, duplicates: ${duplicates}, unmatched: ${unmatched}`);
  return { total: rows.length, matched, partial, overpaid, duplicates, unmatched, results };
}
