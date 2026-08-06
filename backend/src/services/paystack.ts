/**
 * Paystack Integration Service
 * 
 * Fetches transactions from Paystack API and reconciles them
 * against the organization's customers and invoices.
 */

import { supabaseAdmin } from "../config/supabase.js";
import { reconcileTransaction } from "./reconciliation.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_MODE = process.env.PAYSTACK_MODE || "live";

// Safety indicator — visible in server logs on startup
console.log(
  `[Paystack] Running in ${PAYSTACK_MODE.toUpperCase()} MODE. ${
    PAYSTACK_MODE === "test"
      ? "Using test keys — no real money will be moved."
      : "⚠️  LIVE MODE — real transactions are active."
  }`
);


interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number; // in kobo (divide by 100)
  currency: string;
  status: string;
  channel: string;
  paid_at: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Fetch the Paystack secret key for an organization from payment_providers table
 * or fall back to process.env.PAYSTACK_SECRET_KEY.
 */
export async function getPaystackSecretKey(organizationId?: string): Promise<string | null> {
  if (organizationId) {
    const { data } = await supabaseAdmin
      .from("payment_providers")
      .select("credentials_json")
      .eq("organization_id", organizationId)
      .eq("provider_type", "paystack")
      .eq("active", true)
      .limit(1)
      .single();

    if (data?.credentials_json && (data.credentials_json as any).secret_key) {
      return (data.credentials_json as any).secret_key;
    }
  }
  return process.env.PAYSTACK_SECRET_KEY || null;
}


/**
 * Fetch transactions from Paystack API.
 */
async function fetchPaystackTransactions(
  secretKey: string,
  perPage: number = 50,
  page: number = 1
): Promise<PaystackTransaction[]> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction?perPage=${perPage}&page=${page}&status=success`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Paystack API error (${res.status}): ${errText}`);
  }

  const body = (await res.json()) as { data?: PaystackTransaction[] };
  return body.data ?? [];
}

/**
 * Verify a single Paystack transaction by reference.
 */
export async function verifyPaystackTransaction(
  organizationId: string,
  reference: string
): Promise<{ success: boolean; message: string; transaction?: PaystackTransaction }> {
  const secretKey = await getPaystackSecretKey(organizationId);
  if (!secretKey) {
    return { success: false, message: "No active Paystack provider configured for this organization." };
  }

  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    return { success: false, message: `Paystack verification failed (${res.status}).` };
  }

  const body = (await res.json()) as { status?: boolean; data?: PaystackTransaction; message?: string };
  if (!body.status || !body.data) {
    return { success: false, message: body.message || "Verification failed." };
  }

  return { success: true, message: "Transaction verified.", transaction: body.data };
}

/**
 * Sync Paystack transactions for an organization.
 * Fetches recent transactions, stores them in paystack_transactions cache,
 * and reconciles unreconciled ones.
 */
export async function syncPaystackTransactions(organizationId: string): Promise<{
  fetched: number;
  newTransactions: number;
  reconciled: number;
  duplicates: number;
  errors: string[];
}> {
  const secretKey = await getPaystackSecretKey(organizationId);
  if (!secretKey) {
    throw new Error("No active Paystack provider configured for this organization.");
  }

  const errors: string[] = [];
  let fetched = 0;
  let newTransactions = 0;
  let reconciled = 0;
  let duplicates = 0;

  try {
    // Fetch up to 100 recent successful transactions (2 pages)
    const page1 = await fetchPaystackTransactions(secretKey, 50, 1);
    const page2 = await fetchPaystackTransactions(secretKey, 50, 2);
    const allTransactions = [...page1, ...page2];
    fetched = allTransactions.length;

    for (const txn of allTransactions) {
      // Check if already cached
      const { data: existing } = await supabaseAdmin
        .from("paystack_transactions")
        .select("id, reconciled")
        .eq("organization_id", organizationId)
        .eq("paystack_id", txn.id)
        .limit(1);

      if (existing && existing.length > 0) {
        // Already cached
        if (!existing[0].reconciled) {
          // Try to reconcile if not already done
          const result = await reconcileTransaction({
            organization_id: organizationId,
            amount: txn.amount / 100, // kobo → currency unit
            reference: txn.reference,
            customer_email: txn.customer?.email || null,
            customer_phone: txn.customer?.phone || null,
            customer_name: txn.customer
              ? [txn.customer.first_name, txn.customer.last_name].filter(Boolean).join(" ") || null
              : null,
            transaction_id: String(txn.id),
            payment_date: txn.paid_at ? new Date(txn.paid_at).toISOString().slice(0, 10) : undefined,
            source: "paystack",
            channel: txn.channel,
            currency: txn.currency,
            invoice_id: txn.metadata?.invoice_id || null,
          });

          if (result.status === "duplicate") {
            duplicates++;
          } else {
            reconciled++;
            // Mark as reconciled
            await supabaseAdmin
              .from("paystack_transactions")
              .update({
                reconciled: true,
                linked_payment_id: result.payment_id || null,
              })
              .eq("id", existing[0].id);
          }
        }
        continue;
      }

      // Insert into cache
      const customerName = txn.customer
        ? [txn.customer.first_name, txn.customer.last_name].filter(Boolean).join(" ") || null
        : null;

      const { error: insertErr } = await supabaseAdmin
        .from("paystack_transactions")
        .insert({
          organization_id: organizationId,
          paystack_id: txn.id,
          reference: txn.reference,
          amount: txn.amount / 100,
          currency: txn.currency,
          customer_email: txn.customer?.email || null,
          customer_name: customerName,
          customer_phone: txn.customer?.phone || null,
          status: txn.status,
          channel: txn.channel,
          paid_at: txn.paid_at,
          metadata: txn.metadata || null,
          reconciled: false,
        });

      if (insertErr) {
        errors.push(`Failed to cache txn ${txn.reference}: ${insertErr.message}`);
        continue;
      }

      newTransactions++;

      // Reconcile
      const result = await reconcileTransaction({
        organization_id: organizationId,
        amount: txn.amount / 100,
        reference: txn.reference,
        customer_email: txn.customer?.email || null,
        customer_phone: txn.customer?.phone || null,
        customer_name: customerName,
        transaction_id: String(txn.id),
        payment_date: txn.paid_at ? new Date(txn.paid_at).toISOString().slice(0, 10) : undefined,
        source: "paystack",
        channel: txn.channel,
        currency: txn.currency,
        invoice_id: txn.metadata?.invoice_id || null,
      });

      if (result.status === "duplicate") {
        duplicates++;
      } else {
        reconciled++;
        // Update cache with reconciliation link
        await supabaseAdmin
          .from("paystack_transactions")
          .update({
            reconciled: true,
            linked_payment_id: result.payment_id || null,
          })
          .eq("organization_id", organizationId)
          .eq("paystack_id", txn.id);
      }
    }
  } catch (err: any) {
    errors.push(err.message);
  }

  // Audit log
  await supabaseAdmin.from("audit_logs").insert({
    organization_id: organizationId,
    action_type: "paystack_sync",
    action_description: `Paystack sync completed. Fetched: ${fetched}, New: ${newTransactions}, Reconciled: ${reconciled}, Duplicates: ${duplicates}.`,
  });

  // Notification
  await supabaseAdmin.from("notifications").insert({
    organization_id: organizationId,
    title: "Paystack Sync Complete",
    message: `Synced ${fetched} transactions. ${reconciled} reconciled, ${duplicates} duplicates, ${newTransactions} new.`,
    type: "reminder",
  });

  return { fetched, newTransactions, reconciled, duplicates, errors };
}

export interface InitializeInvoicePaymentParams {
  organizationId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  frontendUrl?: string;
}

/**
 * Initialize a Paystack checkout session for an invoice.
 */
export async function initializePaystackInvoicePayment(
  params: InitializeInvoicePaymentParams
): Promise<{ success: boolean; authorizationUrl?: string; reference?: string; message?: string }> {
  const secretKey = await getPaystackSecretKey(params.organizationId);
  if (!secretKey) {
    return { success: false, message: "No Paystack secret key found." };
  }

  const baseUrl = params.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl.replace(/\/$/, "")}/payment-success?invoice_id=${params.invoiceId}`;
  
  // Paystack expects amount in smallest currency unit (kobo/cents -> amount * 100)
  const amountInSubunit = Math.round(params.amount * 100);
  const reference = `INV_${params.invoiceNumber}_${Date.now()}`;

  try {
    const makeInitRequest = async (curr?: string) => {
      const payload: any = {
        email: params.customerEmail,
        amount: amountInSubunit,
        reference,
        callback_url: callbackUrl,
        metadata: {
          invoice_id: params.invoiceId,
          invoice_number: params.invoiceNumber,
          organization_id: params.organizationId,
          customer_name: params.customerName || "",
          custom_fields: [
            {
              display_name: "Invoice Number",
              variable_name: "invoice_number",
              value: params.invoiceNumber,
            },
          ],
        },
      };

      if (curr) {
        payload.currency = curr;
      }

      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return response;
    };

    let response = await makeInitRequest(params.currency);
    let data = (await response.json()) as any;

    // If merchant account rejects specified currency (e.g. NGN vs GHS), retry without currency (uses merchant default)
    if (!response.ok && (data.code === "unsupported_currency" || data.message?.includes("Currency"))) {
      console.warn(`[Paystack] Currency ${params.currency} not enabled on merchant account. Retrying with merchant native default currency...`);
      response = await makeInitRequest(undefined);
      data = (await response.json()) as any;
    }

    if (!response.ok || !data.status) {
      console.error("[Paystack] Initialize error:", data);
      return { success: false, message: data.message || "Failed to initialize Paystack payment" };
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (err: any) {
    console.error("[Paystack] Exception initializing payment:", err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Verify a transaction reference with Paystack and automatically update invoice status to paid.
 */
export async function verifyAndUpdateInvoicePayment(
  reference: string,
  invoiceId?: string,
  organizationId?: string
): Promise<{ success: boolean; message: string; invoice?: any; payment?: any }> {
  let targetInvoiceId = invoiceId;
  let targetOrgId = organizationId;

  if (targetInvoiceId && !targetOrgId) {
    const { data: inv } = await supabaseAdmin
      .from("invoices")
      .select("organization_id")
      .eq("id", targetInvoiceId)
      .single();
    if (inv) {
      targetOrgId = inv.organization_id;
    }
  }

  const secretKey = await getPaystackSecretKey(targetOrgId);
  if (!secretKey) {
    return { success: false, message: "No Paystack secret key configured." };
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return { success: false, message: `Paystack verification request failed (${res.status}).` };
  }

  const body = (await res.json()) as { status?: boolean; data?: PaystackTransaction; message?: string };
  if (!body.status || !body.data) {
    return { success: false, message: body.message || "Verification failed." };
  }

  const txn = body.data;
  if (txn.status !== "success") {
    return { success: false, message: `Transaction status is '${txn.status}', not successful.` };
  }

  targetInvoiceId = targetInvoiceId || txn.metadata?.invoice_id;
  targetOrgId = targetOrgId || txn.metadata?.organization_id;

  if (!targetInvoiceId) {
    return { success: false, message: "No linked invoice found for this payment reference." };
  }

  const { data: invoice, error: invFetchErr } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("id", targetInvoiceId)
    .single();

  if (invFetchErr || !invoice) {
    return { success: false, message: `Invoice ${targetInvoiceId} not found.` };
  }

  let updatedInvoice = invoice;
  if (invoice.status !== "paid") {
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        payment_method: "paystack",
        paid_at: txn.paid_at || new Date().toISOString(),
      })
      .eq("id", targetInvoiceId)
      .select()
      .single();

    if (updateErr) {
      console.error("[Paystack] Error updating invoice status to paid:", updateErr.message);
    } else if (updated) {
      updatedInvoice = updated;
    }
  }

  const reconResult = await reconcileTransaction({
    organization_id: targetOrgId || invoice.organization_id,
    amount: txn.amount / 100,
    reference: txn.reference,
    customer_email: txn.customer?.email || null,
    customer_phone: txn.customer?.phone || null,
    customer_name: txn.customer
      ? [txn.customer.first_name, txn.customer.last_name].filter(Boolean).join(" ") || null
      : null,
    transaction_id: String(txn.id),
    payment_date: txn.paid_at ? new Date(txn.paid_at).toISOString().slice(0, 10) : undefined,
    source: "paystack",
    channel: txn.channel,
    currency: txn.currency,
    customer_id: invoice.customer_id,
    invoice_id: targetInvoiceId,
  });

  await supabaseAdmin.from("audit_logs").insert({
    organization_id: targetOrgId || invoice.organization_id,
    action_type: "invoice_payment",
    action_description: `Invoice #${invoice.invoice_number} paid via Paystack (Ref: ${txn.reference}, Amount: ${txn.currency} ${txn.amount / 100}).`,
    related_record_id: targetInvoiceId,
  });

  await supabaseAdmin.from("notifications").insert({
    organization_id: targetOrgId || invoice.organization_id,
    title: "Invoice Paid via Paystack",
    message: `Invoice #${invoice.invoice_number} of ${txn.currency} ${txn.amount / 100} was automatically marked as PAID.`,
    type: "status_update",
  });

  return {
    success: true,
    message: "Payment verified and invoice updated to PAID.",
    invoice: updatedInvoice,
    payment: reconResult,
  };
}

