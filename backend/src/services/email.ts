/**
 * Transactional Email Service (Triple-Provider Architecture)
 * 
 * Supports Resend, Brevo, and Custom SMTP (Gmail, Outlook, Hostinger, cPanel, etc.)
 * Configure via `EMAIL_PROVIDER` in your `backend/.env` file:
 *   - `EMAIL_PROVIDER="brevo"`   (Sends directly to any customer email. Requires SMTP activation)
 *   - `EMAIL_PROVIDER="resend"`  (Sends via Resend. Auto-redirects to verified sandbox email for testing)
 *   - `EMAIL_PROVIDER="smtp"`    (Sends via custom SMTP - Gmail, Hostinger, etc. Works instantly to anyone!)
 */

import nodemailer from "nodemailer";

interface SendInvoiceEmailParams {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  currency: string;
  portalUrl: string;
  paystackUrl?: string;
  organizationName: string;
  subscribedService?: string;
  accountNumber?: string;
}

export interface SendInvitationEmailParams {
  email: string;
  role: string;
  inviteUrl: string;
  organizationName: string;
  invitedBy: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: params.currency || "NGN",
    maximumFractionDigits: 0,
  }).format(params.amount);

  // Generate a beautiful formatted issue date (e.g. 30 May 2026)
  const issueDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date());

  const serviceName = params.subscribedService || "Subscribed Service";

  // ─── CLASSY LUXURY CORPORATE INVOICE DESIGN (EXACTLY MODELED AFTER THE NEW BORCELLE TEMPLATE) ───
  // A bright, clean, premium white executive design with soft gold-bronze branding accents.
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice — ${params.invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Invoice Container Card (Sleek professional card layout, 100% white theme) -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 12px 40px rgba(15,23,42,0.06);border:1px solid #e2e8f0;overflow:hidden;">
          
          <!-- Top Header: Brand/Logo (Borcelle Style with gold accent) & elegant INVOICE text -->
          <tr>
            <td style="background-color:#ffffff;padding:45px 40px 10px 40px;vertical-align:middle;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Stylid Gold Flower Emblem (Replicating the luxury logo in the image) -->
                        <td style="vertical-align:middle;padding-right:12px;">
                          <table cellpadding="0" cellspacing="0" style="font-size:32px;color:#d4af37;font-weight:bold;">
                            <tr><td>❖</td></tr>
                          </table>
                        </td>
                        <td style="vertical-align:middle;line-height:1.2;">
                          <span style="font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;text-transform:capitalize;display:block;">${params.organizationName}</span>
                          <span style="font-size:11px;color:#64748b;letter-spacing:0.5px;display:block;margin-top:2px;">Meet All Your Needs</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <h1 style="margin:0;font-size:32px;font-weight:300;color:#0f172a;letter-spacing:5px;text-transform:uppercase;">INVOICE</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Client & Invoice Info (Dual column Borcelle-style alignment) -->
          <tr>
            <td style="padding:30px 40px 15px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left side: Billed To / Invoice to details -->
                  <td width="55%" align="left" style="vertical-align:top;line-height:1.6;">
                    <p style="margin:0;font-size:14px;color:#0f172a;font-weight:700;">Invoice to:</p>
                    <p style="margin:4px 0 2px 0;font-size:18px;font-weight:800;color:#0f172a;">${params.customerName}</p>
                    <p style="margin:0;font-size:13px;color:#475569;">${params.customerEmail}</p>
                    ${params.accountNumber ? `<p style="margin:4px 0 0 0;font-size:12px;font-family:monospace;font-weight:700;color:#d4af37;">ACC: ${params.accountNumber}</p>` : ""}
                  </td>
                  <!-- Right side: Meta details aligned perfectly -->
                  <td width="45%" align="right" style="vertical-align:top;line-height:1.6;text-align:right;">
                    <table cellpadding="0" cellspacing="0" align="right" style="font-size:14px;color:#334155;">
                      <tr>
                        <td style="padding-bottom:4px;font-weight:700;text-align:left;width:90px;">Invoice#</td>
                        <td style="padding-bottom:4px;text-align:right;font-weight:500;">${params.invoiceNumber.replace("INV-", "")}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:4px;font-weight:700;text-align:left;">Date</td>
                        <td style="padding-bottom:4px;text-align:right;font-weight:500;">${issueDate}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;text-align:left;color:#e63946;">Due Date</td>
                        <td style="text-align:right;font-weight:700;color:#e63946;">${params.dueDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Itemized Table Section (Borcelle-style minimalist table borders) -->
          <tr>
            <td style="padding:20px 40px 15px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
                <thead>
                  <tr style="border-top:1.5px solid #0f172a;border-bottom:1.5px solid #0f172a;">
                    <th style="padding:12px 0;font-size:12px;font-weight:700;color:#0f172a;text-align:left;">Subscribed Service</th>
                    <th style="padding:12px 0;font-size:12px;font-weight:700;color:#0f172a;text-align:center;width:80px;">Quantity</th>
                    <th style="padding:12px 0;font-size:12px;font-weight:700;color:#0f172a;text-align:right;width:110px;">Unit Price</th>
                    <th style="padding:12px 0;font-size:12px;font-weight:700;color:#0f172a;text-align:right;width:110px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom:1px solid #cbd5e1;">
                    <td style="padding:16px 0;font-size:13px;font-weight:500;color:#1e293b;line-height:1.4;text-transform:uppercase;">${serviceName}</td>
                    <td style="padding:16px 0;font-size:13px;color:#334155;text-align:center;">1</td>
                    <td style="padding:16px 0;font-size:13px;color:#334155;text-align:right;">${formattedAmount}</td>
                    <td style="padding:16px 0;font-size:13px;font-weight:700;color:#0f172a;text-align:right;">${formattedAmount}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals, Payment Method & CTA (Borcelle Bottom Layout) -->
          <tr>
            <td style="padding:15px 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Left: Payment Methods & Luxury Accent Button -->
                  <td width="55%" align="left" style="vertical-align:top;line-height:1.6;padding-right:20px;">
                    <p style="margin:0 0 4px 0;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Payment Method</p>
                    <p style="margin:0 0 16px 0;font-size:12px;color:#475569;line-height:1.4;">
                      Bank Transfer or Card Payment.<br />
                      Click below to pay via the secure Todella portal.
                    </p>
                    <!-- Payment Buttons: Primary Paystack Pay Now + Secondary Upload Receipt -->
                    ${params.paystackUrl ? `
                    <div style="margin-bottom:12px;">
                      <a href="${params.paystackUrl}" target="_blank" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 22px;border-radius:6px;box-shadow:0 4px 12px rgba(5,150,105,0.25);text-transform:uppercase;letter-spacing:0.5px;">
                        💳 Pay Now with Paystack
                      </a>
                    </div>
                    <div>
                      <a href="${params.portalUrl}" target="_blank" style="display:inline-block;background-color:#ffffff;color:#475569;border:1px solid #cbd5e1;text-decoration:none;font-weight:600;font-size:11px;padding:8px 16px;border-radius:6px;text-transform:uppercase;letter-spacing:0.3px;">
                        Upload Bank Receipt Instead
                      </a>
                    </div>
                    ` : `
                    <a href="${params.portalUrl}" style="display:inline-block;background-color:#d4af37;color:#ffffff;text-decoration:none;font-weight:700;font-size:12px;padding:12px 24px;border-radius:4px;box-shadow:0 4px 12px rgba(212,175,55,0.25);text-transform:uppercase;letter-spacing:0.5px;">
                      View &amp; Upload Receipt
                    </a>
                    `}
                  </td>
                  
                  <!-- Right: Clean Totals Grid with bold total line -->
                  <td width="45%" align="right" style="vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
                      <tr>
                        <td style="padding:8px 0;font-weight:700;text-align:left;">Subtotal</td>
                        <td style="padding:8px 0;text-align:right;font-weight:600;">${formattedAmount}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #cbd5e1;">
                        <td style="padding:8px 0 12px 0;font-weight:700;text-align:left;">Tax (0%)</td>
                        <td style="padding:8px 0 12px 0;text-align:right;font-weight:600;">₦0</td>
                      </tr>
                      <tr>
                        <td style="padding:15px 0 0 0;font-size:15px;font-weight:800;color:#0f172a;text-align:left;border-top:1.5px solid #0f172a;">Total</td>
                        <td style="padding:15px 0 0 0;font-size:18px;font-weight:800;color:#0f172a;text-align:right;border-top:1.5px solid #0f172a;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank You & Signature (Borcelle Design) -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size:14px;color:#475569;font-weight:500;vertical-align:bottom;">
                    Thank you for your business!
                  </td>
                  <td align="right" style="vertical-align:bottom;text-align:right;">
                    <table cellpadding="0" cellspacing="0" align="right" style="width:120px;">
                      <tr>
                        <td style="border-bottom:1px solid #d4af37;height:24px;"></td>
                      </tr>
                      <tr>
                        <td style="font-size:10px;color:#64748b;text-align:center;padding-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Authorized Signed</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Muted Gold-Bronze Footer Bar (Borcelle Design Accent) -->
          <tr>
            <td style="background-color:#d4af37;padding:16px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:0.3px;">
                    Todella Ltd | 📞 +234 123 4567
                  </td>
                  <td align="right" style="font-size:11px;color:#ffffff;font-weight:600;">
                    <a href="https://todellaa.com/" style="color:#ffffff;text-decoration:none;font-weight:700;">🌐 todellaa.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ─── 1. Custom SMTP Mode (Gmail, Outlook, Hostinger, GoDaddy, etc.) ───
  if (provider === "smtp") {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return { success: false, provider: "Custom SMTP", error: "SMTP_USER or SMTP_PASS is not configured in backend/.env" };
    }

    try {
      console.log(`[Email] Dispatching payment link to ${params.customerEmail} via Custom SMTP (${smtpHost}:${smtpPort})...`);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // True for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const senderName = process.env.BREVO_SENDER_NAME || "Todella";
      const info = await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: params.customerEmail,
        subject: `Payment Request: Invoice ${params.invoiceNumber} — ${formattedAmount}`,
        html: htmlContent,
      });

      console.log(`[Email] ✅ Success! Payment link sent to ${params.customerEmail} via Custom SMTP`);
      return { success: true, provider: "Custom SMTP", messageId: info.messageId };
    } catch (err: any) {
      console.error(`[Email] ❌ Custom SMTP error: ${err.message}`);
      return { success: false, provider: "Custom SMTP", error: err.message };
    }
  }

  // ─── 2. Brevo Mode ───
  if (provider === "brevo") {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return { success: false, provider: "Brevo", error: "BREVO_API_KEY is not configured in backend/.env" };
    }

    const senderName = process.env.BREVO_SENDER_NAME || "Todella";
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "trinnarysystems@gmail.com";

    try {
      console.log(`[Email] Dispatching payment link to ${params.customerEmail} via Brevo (Sender: ${senderEmail})...`);

      const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: params.customerEmail, name: params.customerName }],
          subject: `Payment Request: Invoice ${params.invoiceNumber} — ${formattedAmount}`,
          htmlContent,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        console.log(`[Email] ✅ Success! Payment link sent to ${params.customerEmail} via Brevo`);
        return { success: true, provider: "Brevo", messageId: data.messageId };
      }

      const errText = await response.text();
      console.error(`[Email] ⚠️ Brevo API rejected dispatch (${errText}). Failing over to Custom SMTP...`);
      
      // Automatic Failover to Custom SMTP if Brevo fails
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false },
          });

          const info = await transporter.sendMail({
            from: `"${senderName}" <${smtpUser}>`,
            to: params.customerEmail,
            subject: `Payment Request: Invoice ${params.invoiceNumber} — ${formattedAmount}`,
            html: htmlContent,
          });

          console.log(`[Email] ✅ Failover Success! Payment link sent to ${params.customerEmail} via Custom SMTP (Failover)`);
          return { success: true, provider: "Custom SMTP (Brevo Failover)", messageId: info.messageId };
        } catch (failoverErr: any) {
          console.error(`[Email] ❌ Failover Custom SMTP failed: ${failoverErr.message}`);
        }
      }

      return { success: false, provider: "Brevo", error: errText };
    } catch (err: any) {
      console.error(`[Email] ❌ Brevo request exception: ${err.message}`);
      return { success: false, provider: "Brevo", error: err.message };
    }
  }

  // ─── 3. Resend Mode (Default for Sandbox Redirection Testing) ───
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { success: false, provider: "Resend", error: "RESEND_API_KEY is not configured in backend/.env" };
  }

  const senderName = process.env.BREVO_SENDER_NAME || "Todella";
  const sandboxRedirectEmail = process.env.RESEND_SANDBOX_REDIRECT || "trinnarysystems@gmail.com";

  try {
    console.log(`[Email] Attempting Resend dispatch (Recipient: ${params.customerEmail})...`);
    let recipient = params.customerEmail;
    let subject = `Payment Request: Invoice ${params.invoiceNumber} — ${formattedAmount}`;
    let finalHtml = htmlContent;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${senderName} <onboarding@resend.dev>`,
        to: [recipient],
        subject: subject,
        html: finalHtml,
      }),
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      const errData: any = await clonedResponse.json().catch(() => ({}));
      
      // If sandbox restriction triggers, automatically redirect to the verified sandbox email for testing
      if (errData.name === "validation_error" && recipient.toLowerCase() !== sandboxRedirectEmail.toLowerCase()) {
        console.warn(`[Email] Sandbox restriction detected. Automatically redirecting delivery to verified sandbox email: ${sandboxRedirectEmail}...`);
        recipient = sandboxRedirectEmail;
        subject = `[SANDBOX REDIRECT] ${subject}`;
        finalHtml = `
          <div style="background: #fff3cd; color: #856404; padding: 12px; border: 1px solid #ffeeba; margin-bottom: 20px; font-family: sans-serif; border-radius: 4px; font-size: 14px;">
            <strong>⚠️ Sandbox Redirection Notice:</strong> This payment link was originally sent to <strong>${params.customerEmail}</strong>, but has been automatically redirected to your verified Resend Sandbox account (${sandboxRedirectEmail}) for testing purposes.
          </div>
          ${htmlContent}
        `;

        const retryResponse = await fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${senderName} <onboarding@resend.dev>`,
            to: [recipient],
            subject: subject,
            html: finalHtml,
          }),
        });

        if (retryResponse.ok) {
          const data: any = await retryResponse.json();
          console.log(`[Email] ✅ Success! Redirected payment link sent to sandbox email via Resend`);
          return { success: true, provider: "Resend", messageId: data.id };
        }
        
        const retryErrText = await retryResponse.text();
        console.error(`[Email] ❌ Resend sandbox retry failed: ${retryErrText}`);
        return { success: false, provider: "Resend", error: retryErrText };
      }
      
      const errText = await response.text();
      console.error(`[Email] ❌ Resend API failed: ${errText}`);
      return { success: false, provider: "Resend", error: errText };
    }

    const data: any = await response.json();
    console.log(`[Email] ✅ Success! Payment link sent to ${params.customerEmail} via Resend`);
    return { success: true, provider: "Resend", messageId: data.id };
  } catch (err: any) {
    console.error(`[Email] ❌ Resend request exception: ${err.message}`);
    return { success: false, provider: "Resend", error: err.message };
  }
}

export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

  let friendlyRole = params.role;
  if (params.role === "viewer") friendlyRole = "Viewer (Read-Only)";
  else if (params.role === "finance_staff") friendlyRole = "Finance Staff";
  else if (params.role === "manager") friendlyRole = "Manager";
  else if (params.role === "admin") friendlyRole = "Administrator";
  else if (params.role === "super_admin") friendlyRole = "Super Admin";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workspace Invitation — ${params.organizationName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Invitation Container Card (Sleek professional card layout, 100% white theme) -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 12px 40px rgba(15,23,42,0.06);border:1px solid #e2e8f0;overflow:hidden;">
          
          <!-- Top Header: Brand/Logo & elegant INVITATION text -->
          <tr>
            <td style="background-color:#ffffff;padding:45px 40px 10px 40px;vertical-align:middle;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Stylid Gold Flower Emblem -->
                        <td style="vertical-align:middle;padding-right:12px;">
                          <table cellpadding="0" cellspacing="0" style="font-size:32px;color:#d4af37;font-weight:bold;">
                            <tr><td>❖</td></tr>
                          </table>
                        </td>
                        <td style="vertical-align:middle;line-height:1.2;">
                          <span style="font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;text-transform:capitalize;display:block;">${params.organizationName}</span>
                          <span style="font-size:11px;color:#64748b;letter-spacing:0.5px;display:block;margin-top:2px;">Meet All Your Needs</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <h1 style="margin:0;font-size:24px;font-weight:300;color:#0f172a;letter-spacing:3px;text-transform:uppercase;">INVITATION</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding:30px 40px 15px 40px;line-height:1.6;font-size:14px;color:#334155;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;font-weight:700;">You've been invited to join the team!</p>
              <p style="margin:0 0 20px 0;">
                Hello,
              </p>
              <p style="margin:0 0 20px 0;">
                <strong>${params.invitedBy}</strong> has invited you to join the <strong>${params.organizationName}</strong> workspace on Todella. 
                You have been assigned the role of <strong>${friendlyRole}</strong>.
              </p>
              
              <!-- Details card -->
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td width="35%" style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Workspace</td>
                  <td style="font-size:14px;color:#0f172a;font-weight:600;">${params.organizationName}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Assigned Role</td>
                  <td style="font-size:14px;color:#0f172a;font-weight:600;text-transform:capitalize;">${friendlyRole}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Invited By</td>
                  <td style="font-size:14px;color:#0f172a;font-weight:600;">${params.invitedBy}</td>
                </tr>
              </table>
              
              <p style="margin:0 0 24px 0;">
                To accept your invitation, please click the secure button below to set up your account and access the workspace dashboard.
              </p>

              <!-- Luxury Button matching the brand styling -->
              <div align="center" style="margin-bottom:20px;">
                <a href="${params.inviteUrl}" style="display:inline-block;background-color:#d4af37;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:14px 28px;border-radius:4px;box-shadow:0 4px 12px rgba(212,175,55,0.25);text-transform:uppercase;letter-spacing:0.5px;">
                  Accept Invitation &amp; Join
                </a>
              </div>
            </td>
          </tr>

          <!-- Thank You & Signature -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size:14px;color:#475569;font-weight:500;vertical-align:bottom;">
                    We are excited to have you on board!
                  </td>
                  <td align="right" style="vertical-align:bottom;text-align:right;">
                    <table cellpadding="0" cellspacing="0" align="right" style="width:120px;">
                      <tr>
                        <td style="border-bottom:1px solid #d4af37;height:24px;"></td>
                      </tr>
                      <tr>
                        <td style="font-size:10px;color:#64748b;text-align:center;padding-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Authorized Signed</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Full Width Muted Gold-Bronze Footer Bar -->
          <tr>
            <td style="background-color:#d4af37;padding:16px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:0.3px;">
                    Todella Ltd | 📞 +234 123 4567
                  </td>
                  <td align="right" style="font-size:11px;color:#ffffff;font-weight:600;">
                    <a href="https://todellaa.com/" style="color:#ffffff;text-decoration:none;font-weight:700;">🌐 todellaa.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ─── 1. Custom SMTP Mode ───
  if (provider === "smtp") {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return { success: false, provider: "Custom SMTP", error: "SMTP_USER or SMTP_PASS is not configured in backend/.env" };
    }

    try {
      console.log(`[Email] Dispatching invitation to ${params.email} via Custom SMTP (${smtpHost}:${smtpPort})...`);

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const senderName = process.env.BREVO_SENDER_NAME || "Todella";
      const info = await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: params.email,
        subject: `Invitation to join ${params.organizationName} on Todella`,
        html: htmlContent,
      });

      console.log(`[Email] ✅ Success! Invitation sent to ${params.email} via Custom SMTP`);
      return { success: true, provider: "Custom SMTP", messageId: info.messageId };
    } catch (err: any) {
      console.error(`[Email] ❌ Custom SMTP error: ${err.message}`);
      return { success: false, provider: "Custom SMTP", error: err.message };
    }
  }

  // ─── 2. Brevo Mode ───
  if (provider === "brevo") {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return { success: false, provider: "Brevo", error: "BREVO_API_KEY is not configured in backend/.env" };
    }

    const senderName = process.env.BREVO_SENDER_NAME || "Todella";
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "trinnarysystems@gmail.com";

    try {
      console.log(`[Email] Dispatching invitation to ${params.email} via Brevo (Sender: ${senderEmail})...`);

      const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: params.email }],
          subject: `Invitation to join ${params.organizationName} on Todella`,
          htmlContent,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        console.log(`[Email] ✅ Success! Invitation sent to ${params.email} via Brevo`);
        return { success: true, provider: "Brevo", messageId: data.messageId };
      }

      const errText = await response.text();
      console.error(`[Email] ❌ Brevo API error: ${errText}`);
      return { success: false, provider: "Brevo", error: errText };
    } catch (err: any) {
      console.error(`[Email] ❌ Brevo request exception: ${err.message}`);
      return { success: false, provider: "Brevo", error: err.message };
    }
  }

  // ─── 3. Resend Mode ───
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { success: false, provider: "Resend", error: "RESEND_API_KEY is not configured in backend/.env" };
  }

  const senderName = process.env.BREVO_SENDER_NAME || "Todella";
  const sandboxRedirectEmail = process.env.RESEND_SANDBOX_REDIRECT || "trinnarysystems@gmail.com";

  try {
    console.log(`[Email] Attempting Resend dispatch (Recipient: ${params.email})...`);
    let recipient = params.email;
    let subject = `Invitation to join ${params.organizationName} on Todella`;
    let finalHtml = htmlContent;

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${senderName} <onboarding@resend.dev>`,
        to: [recipient],
        subject: subject,
        html: finalHtml,
      }),
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      const errData: any = await clonedResponse.json().catch(() => ({}));
      
      if (errData.name === "validation_error" && recipient.toLowerCase() !== sandboxRedirectEmail.toLowerCase()) {
        console.warn(`[Email] Sandbox restriction detected. Automatically redirecting delivery to verified sandbox email: ${sandboxRedirectEmail}...`);
        recipient = sandboxRedirectEmail;
        subject = `[SANDBOX REDIRECT] ${subject}`;
        finalHtml = `
          <div style="background: #fff3cd; color: #856404; padding: 12px; border: 1px solid #ffeeba; margin-bottom: 20px; font-family: sans-serif; border-radius: 4px; font-size: 14px;">
            <strong>⚠️ Sandbox Redirection Notice:</strong> This invitation was originally sent to <strong>${params.email}</strong>, but has been automatically redirected to your verified Resend Sandbox account (${sandboxRedirectEmail}) for testing purposes.
          </div>
          ${htmlContent}
        `;

        const retryResponse = await fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${senderName} <onboarding@resend.dev>`,
            to: [recipient],
            subject: subject,
            html: finalHtml,
          }),
        });

        if (retryResponse.ok) {
          const data: any = await retryResponse.json();
          console.log(`[Email] ✅ Success! Redirected invitation sent to sandbox email via Resend`);
          return { success: true, provider: "Resend", messageId: data.id };
        }
        
        const retryErrText = await retryResponse.text();
        console.error(`[Email] ❌ Resend sandbox retry failed: ${retryErrText}`);
        return { success: false, provider: "Resend", error: retryErrText };
      }
      
      const errText = await response.text();
      console.error(`[Email] ❌ Resend API failed: ${errText}`);
      return { success: false, provider: "Resend", error: errText };
    }

    const data: any = await response.json();
    console.log(`[Email] ✅ Success! Invitation sent to ${params.email} via Resend`);
    return { success: true, provider: "Resend", messageId: data.id };
  } catch (err: any) {
    console.error(`[Email] ❌ Resend request exception: ${err.message}`);
    return { success: false, provider: "Resend", error: err.message };
  }
}
