import nodemailer from 'nodemailer';
import { SupportedLanguage, TeamPass, TeamRegistration } from '@/types';

const isMailConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS?.replace(/\s+/g, '') || '',
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

const SENDER_EMAIL = process.env.SMTP_USER || 'noreply@iswampur.org';
const MAIL_FROM = process.env.MAIL_FROM || `"Iswampur Premier League" <${SENDER_EMAIL}>`;

// Helper to convert HTML to well-structured, readable plain text (avoids MIME multipart spam penalties)
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<hr\s*[\/]?>/gi, '\n---\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Convert localhost / private IP links to production public domain in outgoing emails
// Emails with 'http://localhost' are immediately flagged as phishing/spam by Gmail's link scanner
export function getPublicSiteUrl(inputUrl?: string): string {
  const fallback = 'https://iswampur.vercel.app';
  if (!inputUrl) return fallback;

  if (inputUrl.includes('localhost') || inputUrl.includes('127.0.0.1')) {
    const configuredPublicUrl = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (configuredPublicUrl && !configuredPublicUrl.includes('localhost') && !configuredPublicUrl.includes('127.0.0.1')) {
      return configuredPublicUrl.replace(/\/+$/, '');
    }
    return fallback;
  }

  return inputUrl.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | Uint8Array; contentType?: string; cid?: string }[];
}): Promise<boolean> {
  const recipients = Array.isArray(options.to) ? options.to.filter(Boolean) : [options.to].filter(Boolean);
  if (recipients.length === 0) return false;

  const recipientString = recipients.join(', ');
  if (!transporter) {
    console.log(`[MAIL DISPATCH MOCK] To: ${recipientString} | Subject: "${options.subject}"`);
    return true;
  }

  // Generate clean, readable plain-text counterpart for MIME multipart compliance
  const plainText = options.text || htmlToPlainText(options.html);

  try {
    // IMPORTANT:
    // 1. Do NOT set a custom fake 'messageId' - Gmail SMTP generates its own authentic, DKIM-signed Message-ID.
    // 2. Do NOT add 'List-Unsubscribe' on 1-to-1 transactional emails (causes Gmail to show "Unsubscribe" & flag as marketing spam).
    // 3. Do NOT add custom 'X-Mailer' (triggers UNRESOLVED_X_MAILER spam rules).
    await transporter.sendMail({
      from: MAIL_FROM,
      to: recipients,
      replyTo: SENDER_EMAIL,
      subject: options.subject,
      text: plainText,
      html: options.html,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
        cid: a.cid,
      })),
    });
    console.log(`[MAIL DISPATCH SUCCESS] Delivered to: ${recipientString}`);
    return true;
  } catch (error) {
    console.error('Failed to dispatch email:', error);
    return false;
  }
}

// 1. Team Submission Received Email (Sent to applicant immediately upon submission)
export async function sendRegistrationReceivedEmail(
  reg: TeamRegistration,
  siteUrl: string
): Promise<boolean> {
  const isBn = reg.language === 'bn';
  const subject = isBn
    ? `[ঈশ্বমপুর প্রিমিয়ার লীগ] আপনার দল নিবন্ধন আবেদন জমা হয়েছে (${reg.team.name})`
    : `[Iswampur Premier League] Registration Received - Pass Generated in 24 Hours (${reg.team.name})`;

  const safeUrl = getPublicSiteUrl(siteUrl);
  const trackUrl = `${safeUrl}/my-registration?id=${reg.id}`;
  const recipients = Array.from(new Set([reg.team.email, reg.ownerEmail].filter(Boolean))) as string[];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 1px solid #1d3575; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <!-- Top Broadcast Accent Bar -->
        <tr>
          <td height="5" style="background: linear-gradient(90deg, #F26522, #F9A01B, #00A3E0);"></td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding: 28px 24px 20px 24px; text-align: center; background-color: #050D24; border-bottom: 1px solid #1d3575;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
              ISWAMPUR PREMIER LEAGUE 2026
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #F9A01B; text-transform: uppercase; letter-spacing: 1px;">
              ${isBn ? 'দল নিবন্ধন আবেদন প্রাপ্তি নিশ্চিতকরণ' : 'SQUAD REGISTRATION CONFIRMATION'}
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 30px 24px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 15px; font-weight: bold; color: #ffffff;">
              নমস্কার / Dear ${reg.team.representativeName || 'Team Captain'},
            </p>

            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              ${
                isBn
                  ? `আপনার ক্রিকেট দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> এর নিবন্ধন আবেদন এবং পেমেন্ট সফলভাবে জমা হয়েছে।`
                  : `Your squad registration and payment proof for <strong style="color: #ffffff;">"${reg.team.name}"</strong> have been successfully received.`
              }
            </p>

            <!-- 24 HOURS NOTICE BANNER -->
            <div style="background: linear-gradient(135deg, rgba(242,101,34,0.15), rgba(249,160,27,0.15)); border: 1px solid #F9A01B; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
              <p style="margin: 0; font-size: 14px; font-weight: 800; color: #F9A01B; display: flex; align-items: center; gap: 8px;">
                ⏱️ ${isBn ? 'আগামী ২৪ ঘণ্টার মধ্যে পাস ইস্যু করা হবে:' : 'Pass Generation within 24 Hours:'}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #f1f5f9; line-height: 1.5;">
                ${
                  isBn
                    ? 'আমাদের টুর্নামেন্ট কমিটি আগামী <strong>২৪ ঘণ্টার (24 Hours)</strong> মধ্যে আপনার দেওয়া সমস্ত তথ্য, খেলোয়াড় তালিকা এবং পেমেন্ট রসিদ যাচাই করবে। যাচাই সম্পন্ন হওয়া মাত্রই আপনার দলের অফিসিয়াল <strong>ডিজিটাল টিম পাস (Matchday QR Pass)</strong> স্বয়ংক্রিয়ভাবে তৈরি হয়ে এই ইমেইলে পাঠিয়ে দেওয়া হবে।'
                    : 'Our tournament review committee will verify your squad roster and payment details within <strong>24 hours</strong>. Once confirmed, your official <strong>Digital Matchday Team Pass with QR code</strong> will be generated and dispatched directly to your email.'
                }
              </p>
            </div>

            <!-- Registration Badge Box -->
            <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #0C1A40; border-left: 4px solid #F9A01B; border-radius: 8px; margin: 20px 0;">
              <tr>
                <td>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Registration ID:</strong> <span style="font-family: monospace; color: #F9A01B; font-weight: bold;">${reg.id}</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Team Name:</strong> <span style="color: #ffffff; font-weight: bold;">${reg.team.name}</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Representative:</strong> <span style="color: #ffffff;">${reg.team.representativeName} (${reg.team.phone})</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Payment UTR:</strong> <span style="font-family: monospace; color: #ffffff;">${reg.payment.utr || 'Under Verification'} (₹${reg.payment.amount})</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Review Status:</strong> <span style="color: #38bdf8; font-weight: bold;">Under Admin Review (যাচাই প্রক্রিয়াধীন - ২৪ ঘণ্টার মধ্যে)</span>
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
              <tr>
                <td align="center" style="border-radius: 12px; background: linear-gradient(90deg, #F26522, #F9A01B);">
                  <a href="${trackUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 800; color: #050D24; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${isBn ? 'আবেদনের স্থিতি দেখুন (Track Status)' : 'Track Application Status'}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1d3575; background-color: #050D24;">
            <p style="margin: 0; color: #94a3b8; font-weight: bold;">ঈশ্বমপুর স্পোর্টস অ্যান্ড কালচারাল কমিটি | আইপিএল ২০২৬</p>
            <p style="margin: 4px 0 0 0;">Iswampur Central Sports Ground, Iswampur Village</p>
            <p style="margin: 4px 0 0 0; color: #475569;">This is an automated tournament system notification. Please do not reply directly to this message.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: recipients, subject, html });
}

// 2. Reviewer Admins Notification Email (Sent to skahidulla568@gmail.com and configured reviewer admins)
export async function sendReviewerAlertEmail(
  reg: TeamRegistration,
  reviewerEmails: string[],
  siteUrl: string
): Promise<boolean> {
  if (!reviewerEmails || reviewerEmails.length === 0) return true;

  const subject = `[নতুন দল নিবন্ধন] ${reg.team.name} - আইপিএল ২০২৬ (যাচাই ও অনুমোদন প্রয়োজন)`;
  const safeUrl = getPublicSiteUrl(siteUrl);
  const adminUrl = `${safeUrl}/admin/registrations?id=${reg.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 1px solid #1d3575;">
        <tr><td height="5" style="background: linear-gradient(90deg, #F26522, #F9A01B, #00A3E0);"></td></tr>
        <tr>
          <td style="padding: 28px 24px;">
            <span style="font-size: 11px; font-weight: 800; color: #00A3E0; text-transform: uppercase; letter-spacing: 1.5px;">ADMIN REVIEW REQUIRED</span>
            <h2 style="color: #F9A01B; margin: 4px 0 12px 0; font-size: 20px;">নতুন দল নিবন্ধন জমা হয়েছে</h2>
            <p style="color: #e2e8f0; font-size: 14px; margin: 0 0 16px 0;">
              দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> টুর্নামেন্টে অংশগ্রহণের জন্য আবেদন ও পেমেন্ট রসিদ জমা দিয়েছে। অনুগ্রহ করে ২৪ ঘণ্টার মধ্যে পর্যালোচনা করুন।
            </p>
            
            <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #1d3575; background: #0C1A40; border-radius: 10px; margin: 15px 0; font-size: 13px;">
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575; width: 140px;">দল / টিম:</td><td style="color: #ffffff; font-weight: bold; border-bottom: 1px solid #1d3575;">${reg.team.name}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">প্রতিনিধি / ক্যাপ্টেন:</td><td style="color: #ffffff; font-weight: bold; border-bottom: 1px solid #1d3575;">${reg.team.representativeName}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">মোবাইল নম্বর:</td><td style="color: #38bdf8; font-family: monospace; font-weight: bold; border-bottom: 1px solid #1d3575;">${reg.team.phone}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">ইমেইল ঠিকানা:</td><td style="color: #ffffff; font-family: monospace; border-bottom: 1px solid #1d3575;">${reg.team.email || reg.ownerEmail}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">খেলোয়াড় সংখ্যা:</td><td style="color: #ffffff; border-bottom: 1px solid #1d3575;">${reg.team.members.length} জন রেজিস্টার্ড</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">ফি / পেমেন্ট UTR:</td><td style="color: #F9A01B; font-weight: bold; border-bottom: 1px solid #1d3575;">₹${reg.payment.amount} (UTR: ${reg.payment.utr || 'N/A'})</td></tr>
              <tr><td style="color: #94a3b8;">আবেদনের সময়:</td><td style="color: #cbd5e1; font-size: 12px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            </table>

            <table align="center" style="margin: 25px auto 10px auto;">
              <tr>
                <td style="background: linear-gradient(90deg, #F26522, #F9A01B); border-radius: 10px;">
                  <a href="${adminUrl}" style="display: inline-block; padding: 13px 26px; color: #050D24; font-weight: 900; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">
                    অ্যাডমিন প্যানেলে পর্যালোচনা করুন →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1d3575; background-color: #050D24;">
            Iswampur Premier League • Automated Super Admin Alert Dispatcher
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: reviewerEmails, subject, html });
}

// 3. Approval Email with Attached PDF Pass (Preserving existing congratulations design)
export async function sendApprovalEmail(
  reg: TeamRegistration,
  pass: TeamPass,
  pdfBytes: Uint8Array,
  siteUrl: string
): Promise<boolean> {
  const isBn = reg.language === 'bn';
  const subject = isBn
    ? `🏆 অভিনন্দন! "${reg.team.name}" এর আইপিএল ২০২৬ দল নিবন্ধন অনুমোদিত হয়েছে (টিম পাস সংযুক্ত)`
    : `🏆 Congratulations! Entry Approved for "${reg.team.name}" - Official Matchday Pass Attached`;

  const safeUrl = getPublicSiteUrl(siteUrl);
  const downloadUrl = `${safeUrl}/api/passes/${pass.passId}/download`;
  const verifyUrl = `${safeUrl}/verify/${pass.passId}`;
  const recipients = Array.from(new Set([reg.team.email, reg.ownerEmail].filter(Boolean))) as string[];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 2px solid #1E3B8A; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
        <!-- Top Broadcast Accent Bar -->
        <tr>
          <td height="5" style="background: linear-gradient(90deg, #F26522, #F9A01B, #00A3E0);"></td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding: 30px 24px 20px 24px; text-align: center; background-color: #050D24; border-bottom: 1px solid #1d3575;">
            <p style="margin: 0; font-size: 11px; font-weight: 800; color: #00A3E0; text-transform: uppercase; letter-spacing: 2px;">
              OFFICIAL MATCH ENTRY CONFIRMATION
            </p>
            <h1 style="margin: 6px 0 0 0; font-size: 24px; font-weight: 900; color: #ffffff;">
              ISWAMPUR PREMIER LEAGUE 2026
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; font-weight: 800; color: #F9A01B;">
              ${isBn ? 'অভিনন্দন! আপনার দলের এন্ট্রি চূড়ান্ত হয়েছে' : 'CONGRATULATIONS! SQUAD ENTRY APPROVED'}
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 30px 24px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 15px; font-weight: bold; color: #ffffff;">
              প্রিয় / Dear ${reg.team.representativeName},
            </p>

            <p style="color: #cbd5e1;">
              ${
                isBn
                  ? `ঈশ্বমপুর স্পোর্টস কমিটির পক্ষ থেকে আপনাকে ও আপনার দল <strong style="color: #ffffff;">"${reg.team.name}"</strong>-কে আন্তরিক অভিনন্দন! আপনার পেমেন্ট ও খেলোয়াড় তালিকা সফলভাবে অনুমোদিত হয়েছে।`
                  : `Hearty congratulations from the Iswampur Sports Committee! Your team registration and roster for <strong style="color: #ffffff;">"${reg.team.name}"</strong> have been officially approved.`
              }
            </p>

            <!-- GOLD PASS CODE HERO CARD -->
            <table width="100%" cellpadding="16" cellspacing="0" style="background: linear-gradient(135deg, #F9A01B, #F26522); border-radius: 12px; margin: 24px 0; text-align: center; border: 2px solid #ffffff; box-shadow: 0 4px 15px rgba(242,101,34,0.4);">
              <tr>
                <td>
                  <span style="font-size: 11px; font-weight: 900; color: #050D24; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
                    ${isBn ? 'অফিসিয়াল টিম পাস কোড (PASS CODE / ID)' : 'OFFICIAL PASS CODE / ID'}
                  </span>
                  <span style="font-family: monospace; font-size: 24px; font-weight: 900; color: #050D24; letter-spacing: 2px; display: block; margin: 4px 0;">
                    ${pass.humanPassCode}
                  </span>
                  <span style="font-family: monospace; font-size: 11px; color: #050D24; opacity: 0.8; display: block;">
                    ${pass.passId}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Tournament Details Table -->
            <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #0C1A40; border-radius: 10px; border: 1px solid #1d3575; font-size: 13px; margin: 15px 0;">
              <tr>
                <td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">টুর্নামেন্টের তারিখ:</td>
                <td style="color: #ffffff; font-weight: bold; border-bottom: 1px solid #1d3575;">${pass.eventDate}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">মাঠের স্থান (Venue):</td>
                <td style="color: #ffffff; font-weight: bold; border-bottom: 1px solid #1d3575;">${pass.venue.bn || pass.venue.en}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8;">খেলোয়াড় সংখ্যা:</td>
                <td style="color: #ffffff; font-weight: bold;">${pass.memberCount} জন রেজিস্টার্ড</td>
              </tr>
            </table>

            <p style="color: #F9A01B; font-weight: bold; font-size: 13px; background-color: rgba(249,160,27,0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(249,160,27,0.3);">
              ⚠️ ${
                isBn
                  ? 'জরুরি নির্দেশ: এই ইমেইলের সাথে সংযুক্ত অফিসিয়াল PDF টিম পাসটি ডাউনলোড বা প্রিন্ট করে খেলার দিন মাঠে খেলোয়াড়দের সাথে নিয়ে আসবেন।'
                  : 'Important Gate Rule: Please download or print the attached official PDF matchday pass. Squad photo IDs are required for ground check-in.'
              }
            </p>

            <!-- Buttons -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 25px auto;">
              <tr>
                <td style="padding-right: 12px;">
                  <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 12px 22px; font-size: 13px; font-weight: 800; color: #ffffff; background: linear-gradient(90deg, #F26522, #F9A01B); text-decoration: none; border-radius: 10px; text-transform: uppercase;">
                    ${isBn ? 'PDF পাস ডাউনলোড' : 'Download PDF Pass'}
                  </a>
                </td>
                <td>
                  <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 12px 22px; font-size: 13px; font-weight: 800; color: #ffffff; background: #0C1A40; border: 1px solid #1d3575; text-decoration: none; border-radius: 10px;">
                    ${isBn ? 'কিউআর যাচাই পৃষ্ঠা' : 'Verify Online'}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1d3575; background-color: #050D24;">
            <p style="margin: 0; color: #94a3b8; font-weight: bold;">ঈশ্বমপুর গ্রাম স্পোর্টস অ্যান্ড কালচারাল কমিটি | আইপিএল ২০২৬</p>
            <p style="margin: 4px 0 0 0;">Official Ground Check-In System | Iswampur Digital Platform</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipients,
    subject,
    html,
    attachments: [
      {
        filename: `Iswampur_IPL26_Pass_${pass.humanPassCode}.pdf`,
        content: pdfBytes,
        contentType: 'application/pdf',
      },
    ],
  });
}

// 4. Rejection or Correction Required Email
export async function sendReviewStatusUpdateEmail(
  reg: TeamRegistration,
  status: 'REJECTED' | 'CORRECTION_REQUIRED',
  reason: string,
  siteUrl: string
): Promise<boolean> {
  const isBn = reg.language === 'bn';
  const isCorrection = status === 'CORRECTION_REQUIRED';

  const subject = isCorrection
    ? `[জরুরি সংশোধন প্রয়োজন] "${reg.team.name}" - আইপিএল ২০২৬ নিবন্ধন পর্যালোচনা`
    : `[নিবন্ধন আবেদন বাতিল] "${reg.team.name}" - আইপিএল ২০২৬ নিবন্ধন`;

  const safeUrl = getPublicSiteUrl(siteUrl);
  const editUrl = `${safeUrl}/my-registration?id=${reg.id}`;
  const recipients = Array.from(new Set([reg.team.email, reg.ownerEmail].filter(Boolean))) as string[];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 1px solid #1d3575; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <tr><td height="5" style="background: ${isCorrection ? 'linear-gradient(90deg, #F26522, #F9A01B)' : 'linear-gradient(90deg, #e11d48, #f43f5e)'};"></td></tr>
        <tr>
          <td style="padding: 28px 24px;">
            <span style="font-size: 11px; font-weight: 800; color: ${isCorrection ? '#F9A01B' : '#f43f5e'}; text-transform: uppercase; letter-spacing: 1.5px;">
              ${isCorrection ? 'ACTION REQUIRED • CORRECTION NEEDED' : 'APPLICATION UPDATE • REJECTED'}
            </span>
            <h2 style="color: ${isCorrection ? '#F9A01B' : '#f43f5e'}; margin: 6px 0 14px 0; font-size: 21px; font-weight: 900;">
              ${isCorrection ? 'নিবন্ধন তথ্যে জরুরি সংশোধন প্রয়োজন' : 'নিবন্ধন আবেদনটি বাতিল করা হয়েছে'}
            </h2>
            <p style="color: #cbd5e1; font-size: 14px;">প্রিয় <strong>${reg.team.representativeName || 'Team Captain'}</strong>,</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
              ${
                isCorrection
                  ? `আপনার দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> এর নিবন্ধন আবেদনটি টুর্নামেন্ট কমিটি পর্যালোচনা করেছে। অনুমোদনের জন্য নিচে উল্লেখিত বিষয়টি সংশোধন করা আবশ্যক:`
                  : `টুর্নামেন্ট কমিটির পর্যালোচনার পর আপনার দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> এর নিবন্ধন আবেদনটি গ্রহণ করা সম্ভব হয়নি।`
              }
            </p>
            
            <!-- ADMIN NOTE BOX -->
            <div style="background: #0C1A40; border-left: 4px solid ${isCorrection ? '#F9A01B' : '#f43f5e'}; padding: 16px; border-radius: 8px; margin: 18px 0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${isCorrection ? 'অ্যাডমিন নির্দেশিকা / কী সংশোধন করতে হবে:' : 'বাতিল করার কারণ / Admin Reason:'}
              </p>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; font-weight: bold; line-height: 1.5;">
                ${reason || (isCorrection ? 'অসম্পূর্ণ বা অপাঠ্য তথ্য। পুনরায় যাচাই করে সঠিক তথ্য দিন।' : 'নিয়মাবলি বা পেমেন্ট শর্ত পূরণ না করায় বাতিল করা হয়েছে।')}
              </p>
            </div>

            ${
              isCorrection
                ? `
                   <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 20px 0;">
                     ${isBn ? 'তথ্য সংশোধন করে পুনরায় জমা দিলে অ্যাডমিন দ্রুত তা পুনরায় যাচাই করে আপনার ডিজিটাল টিম পাস ইস্যু করে দেবে।' : 'Please update the required information and resubmit. Our reviewers will re-check and issue your pass promptly.'}
                   </p>
                   <table align="center" style="margin: 20px auto;">
                     <tr>
                       <td style="background: linear-gradient(90deg, #F26522, #F9A01B); border-radius: 10px;">
                         <a href="${editUrl}" style="display: inline-block; padding: 13px 26px; color: #050D24; font-weight: 900; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">
                           ${isBn ? 'তথ্য সংশোধন ও জমা দিন (Edit & Resubmit) →' : 'Edit & Resubmit Now →'}
                         </a>
                       </td>
                     </tr>
                   </table>
                  `
                : `
                   <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
                     ${isBn ? 'যদি আপনি মনে করেন এটি ভুলবশত হয়েছে, তবে টুর্নামেন্ট কমিটির সাথে যোগাযোগ করুন।' : 'If you believe this was made in error, please contact tournament organizers.'}
                   </p>
                  `
            }
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1d3575; background-color: #050D24;">
            <p style="margin: 0; color: #94a3b8; font-weight: bold;">ঈশ্বমপুর গ্রাম স্পোর্টস অ্যান্ড কালচারাল কমিটি | আইপিএল ২০২৬</p>
            <p style="margin: 4px 0 0 0;">Official Ground Check-In System | Iswampur Digital Platform</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: recipients, subject, html });
}

export async function sendContactReplyEmail(options: {
  to: string;
  recipientName: string;
  originalMessage: string;
  replyMessage: string;
  adminName?: string;
}): Promise<boolean> {
  const { to, recipientName, originalMessage, replyMessage, adminName } = options;
  const siteUrl = getPublicSiteUrl();
  const subject = `Re: আপনার বার্তার উত্তর (Response to your inquiry) - ঈশ্বমপুর গ্রাম কমিটি`;

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 24px 0; background-color: #050D24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #071333; border: 1px solid #1D3575; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <!-- Top Accent Strip -->
        <tr>
          <td style="height: 4px; background: linear-gradient(90deg, #F26522, #F9A01B, #19398A);"></td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding: 28px 24px 20px 24px; text-align: center; border-bottom: 1px solid #1D3575;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
              ঈশ্বমপুর গ্রাম কমিটি ও আইপিএল পোর্টাল
            </h1>
            <p style="margin: 4px 0 0 0; color: #F9A01B; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              Official Helpdesk & Communication
            </p>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding: 28px 24px;">
            <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 15px; font-weight: 700;">
              নমস্কার ${recipientName},
            </p>
            <p style="margin: 0 0 20px 0; color: #CBD5E1; font-size: 13.5px; line-height: 1.6;">
              ঈশ্বমপুর গ্রাম পোর্টালের যোগাযোগ ফর্মের মাধ্যমে পাঠানো আপনার বার্তার উত্তর নিচে প্রদান করা হলো:
            </p>

            <!-- Admin Reply Box -->
            <div style="background-color: #0C1A40; border-left: 4px solid #10B981; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0; color: #10B981; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                💬 অ্যাডমিন উত্তর (Official Response):
              </p>
              <div style="color: #FFFFFF; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-weight: 500;">${replyMessage}</div>
              ${adminName ? `<p style="margin: 12px 0 0 0; color: #94A3B8; font-size: 11px; text-align: right; font-style: italic;">— ${adminName} (Village Committee Desk)</p>` : ''}
            </div>

            <!-- Original Inquiry Box -->
            <div style="background-color: #08143A; border: 1px solid #1D3575; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 6px 0; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                আপনার মূল জিজ্ঞাসা (Your Original Message):
              </p>
              <p style="margin: 0; color: #94A3B8; font-size: 12.5px; line-height: 1.5; font-style: italic;">
                "${originalMessage}"
              </p>
            </div>

            <!-- Action Button -->
            <table align="center" style="margin: 20px auto 10px auto;">
              <tr>
                <td style="background: linear-gradient(90deg, #F26522, #F9A01B); border-radius: 10px;">
                  <a href="${siteUrl}" style="display: inline-block; padding: 12px 24px; color: #050D24; font-weight: 900; text-decoration: none; text-transform: uppercase; font-size: 12.5px; letter-spacing: 0.5px;">
                    ঈশ্বমপুর পোর্টাল পরিদর্শন করুন →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 18px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #1D3575; background-color: #050D24;">
            <p style="margin: 0; color: #94A3B8; font-weight: bold;">ঈশ্বমপুর গ্রাম কমিটি ও ক্রীড়া পরিষদ</p>
            <p style="margin: 4px 0 0 0;">Iswampur Village, PO: Iswampur, West Bengal, India • contact@iswampur.org</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

