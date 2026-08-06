/**
 * Paystack API Routes
 * 
 * POST /api/paystack/sync     — Sync all recent Paystack transactions for org
 * POST /api/paystack/verify   — Verify a single transaction by reference
 */

import { Router, Request, Response } from "express";
import {
  syncPaystackTransactions,
  verifyPaystackTransaction,
  initializePaystackInvoicePayment,
  verifyAndUpdateInvoicePayment,
} from "../services/paystack.js";
import { reconcileTransaction } from "../services/reconciliation.js";

const router = Router();

// ─── POST /api/paystack/sync ───
// Triggers full transaction sync and reconciliation
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.body;

    if (!organization_id) {
      res.status(400).json({ error: "Missing organization_id" });
      return;
    }

    const result = await syncPaystackTransactions(organization_id);

    res.json({
      success: true,
      message: `Paystack sync completed. ${result.reconciled} transactions reconciled.`,
      ...result,
    });
  } catch (err: any) {
    console.error("[Paystack] Sync error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/paystack/verify ───
// Verify a single Paystack transaction and reconcile it
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { organization_id, reference } = req.body;

    if (!organization_id || !reference) {
      res.status(400).json({ error: "Missing organization_id or reference" });
      return;
    }

    const verification = await verifyPaystackTransaction(organization_id, reference);

    if (!verification.success || !verification.transaction) {
      res.status(400).json({ success: false, message: verification.message });
      return;
    }

    const txn = verification.transaction;

    // Reconcile the verified transaction
    const result = await reconcileTransaction({
      organization_id,
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
      invoice_id: txn.metadata?.invoice_id || null,
    });

    res.json({
      success: true,
      verification: verification.message,
      reconciliation: result,
    });
  } catch (err: any) {
    console.error("[Paystack] Verify error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/paystack/initialize-invoice ───
// Initializes a Paystack checkout session for an invoice
router.post("/initialize-invoice", async (req: Request, res: Response) => {
  try {
    const {
      organization_id,
      invoice_id,
      invoice_number,
      amount,
      currency,
      customer_email,
      customer_name,
      frontend_url,
    } = req.body;

    if (!organization_id || !invoice_id || !amount || !customer_email) {
      res.status(400).json({ error: "Missing required fields for Paystack payment initialization" });
      return;
    }

    const result = await initializePaystackInvoicePayment({
      organizationId: organization_id,
      invoiceId: invoice_id,
      invoiceNumber: invoice_number || invoice_id,
      amount: parseFloat(amount),
      currency: currency || "NGN",
      customerEmail: customer_email,
      customerName: customer_name,
      frontendUrl: frontend_url,
    });

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (err: any) {
    console.error("[Paystack] Initialize invoice payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/paystack/verify-invoice-payment ───
// Verifies transaction reference and updates invoice status to paid automatically
router.post("/verify-invoice-payment", async (req: Request, res: Response) => {
  try {
    const { reference, invoice_id, organization_id } = req.body;

    if (!reference) {
      res.status(400).json({ error: "Missing transaction reference" });
      return;
    }

    const result = await verifyAndUpdateInvoicePayment(reference, invoice_id, organization_id);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (err: any) {
    console.error("[Paystack] Verify invoice payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/paystack/webhook ───
// Receives transaction updates from Paystack webhooks
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    if (event === "charge.success" && data) {
      const organizationId = data.metadata?.organization_id;
      const invoiceId = data.metadata?.invoice_id;

      if (invoiceId && data.reference) {
        // Automatically verify and update invoice to PAID
        const invResult = await verifyAndUpdateInvoicePayment(data.reference, invoiceId, organizationId);
        res.status(200).json({ status: "success", type: "invoice_auto_paid", invResult });
        return;
      }

      if (!organizationId) {
        console.warn("[Paystack Webhook] Missing organization_id in metadata");
        res.status(200).json({ status: "skipped", message: "Missing organization_id" });
        return;
      }

      // Reconcile the webhook transaction
      const result = await reconcileTransaction({
        organization_id: organizationId,
        amount: data.amount / 100, // kobo → currency unit
        reference: data.reference,
        customer_email: data.customer?.email || null,
        customer_phone: data.customer?.phone || null,
        customer_name: data.customer
          ? [data.customer.first_name, data.customer.last_name].filter(Boolean).join(" ") || null
          : null,
        transaction_id: String(data.id),
        payment_date: data.paid_at ? new Date(data.paid_at).toISOString().slice(0, 10) : undefined,
        source: "paystack",
        channel: data.channel,
        currency: data.currency,
      });

      res.status(200).json({ status: "success", result });
      return;
    }

    res.status(200).json({ status: "ignored" });
  } catch (err: any) {
    console.error("[Paystack Webhook] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
