import nodemailer from 'nodemailer';
import crypto from 'crypto';
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
        user: process.env.SMTP_USER || 'sumanaisbadgirl@gmail.com',
        pass: process.env.SMTP_PASS || 'bfgn xeph emsg inee',
      },
    })
  : null;

const SENDER_EMAIL = process.env.SMTP_USER || 'sumanaisbadgirl@gmail.com';
const MAIL_FROM = process.env.MAIL_FROM || `"Iswampur Premier League" <${SENDER_EMAIL}>`;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | Uint8Array; contentType?: string; cid?: string }[];
}): Promise<boolean> {
  const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
  if (!transporter) {
    console.log(`[MAIL DISPATCH MOCK] To: ${recipients} | Subject: "${options.subject}"`);
    return true;
  }

  // Anti-spam Message-ID and headers
  const messageId = `<ipl.${Date.now()}.${crypto.randomBytes(6).toString('hex')}@gmail.com>`;
  const plainText = options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: options.to,
      replyTo: SENDER_EMAIL,
      subject: options.subject,
      text: plainText,
      html: options.html,
      messageId: messageId,
      headers: {
        'X-Mailer': 'Iswampur Premier League Dispatcher 2.0',
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${SENDER_EMAIL}?subject=unsubscribe>`,
      },
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
        cid: a.cid,
      })),
    });
    console.log(`[MAIL DISPATCH SUCCESS] Delivered to: ${recipients}`);
    return true;
  } catch (error) {
    console.error('Failed to dispatch email:', error);
    return false;
  }
}

// 1. Team Submission Received Email
export async function sendRegistrationReceivedEmail(
  reg: TeamRegistration,
  siteUrl: string
): Promise<boolean> {
  const isBn = reg.language === 'bn';
  const subject = isBn
    ? `[ঈশ্বমপুর প্রিমিয়ার লীগ] আপনার দল নিবন্ধন আবেদন জমা হয়েছে (${reg.team.name})`
    : `[Iswampur Premier League] Squad Registration Received (${reg.team.name})`;

  const trackUrl = `${siteUrl}/my-registration?id=${reg.id}`;

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
              নমস্কার / Dear ${reg.team.representativeName},
            </p>

            <p style="color: #cbd5e1;">
              ${
                isBn
                  ? `আপনার ক্রিকেট দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> এর নিবন্ধন আবেদনটি সফলভাবে সিস্টেমে গৃহীত হয়েছে।`
                  : `Your team entry application for <strong style="color: #ffffff;">"${reg.team.name}"</strong> has been successfully received by the tournament committee.`
              }
            </p>

            <!-- Registration Badge Box -->
            <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #0C1A40; border-left: 4px solid #F9A01B; border-radius: 8px; margin: 20px 0;">
              <tr>
                <td>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Registration ID:</strong> <span style="font-family: monospace; color: #F9A01B; font-weight: bold;">${reg.id}</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Payment UTR:</strong> <span style="font-family: monospace; color: #ffffff;">${reg.payment.utr || 'Under Verification'}</span>
                  </p>
                  <p style="margin: 3px 0; font-size: 13px; color: #94a3b8;">
                    <strong style="color: #cbd5e1;">Review Status:</strong> <span style="color: #38bdf8; font-weight: bold;">Under Admin Review (যাচাই প্রক্রিয়াধীন)</span>
                  </p>
                </td>
              </tr>
            </table>

            <p style="color: #cbd5e1;">
              ${
                isBn
                  ? 'আমাদের অ্যাডমিন প্যানেল আপনার প্রেরিত পেমেন্ট স্ক্রিনশট ও খেলোয়াড় তালিকা যাচাই করছেন। অনুমোদিত হলে স্বয়ংক্রিয়ভাবে ডিজিটাল কিউআর টিম পাস এই ইমেইলে পাঠিয়ে দেওয়া হবে।'
                  : 'Our tournament reviewer desk is currently verifying your payment screenshot and registered squad members. Once approved, your official team pass with digital QR verification will be dispatched immediately.'
              }
            </p>

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

  return sendEmail({ to: reg.team.email, subject, html });
}

// 2. Reviewer Admins Notification Email
export async function sendReviewerAlertEmail(
  reg: TeamRegistration,
  reviewerEmails: string[],
  siteUrl: string
): Promise<boolean> {
  if (!reviewerEmails || reviewerEmails.length === 0) return true;

  const subject = `[নতুন নিবন্ধন পর্যালোচনা] ${reg.team.name} - আইপিএল ২০২৬`;
  const adminUrl = `${siteUrl}/admin/registrations?id=${reg.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 1px solid #1d3575;">
        <tr><td height="5" style="background: linear-gradient(90deg, #F26522, #F9A01B);"></td></tr>
        <tr>
          <td style="padding: 24px;">
            <h2 style="color: #F9A01B; margin: 0 0 10px 0;">নতুন দল নিবন্ধন জমা হয়েছে</h2>
            <p style="color: #e2e8f0;">দল <strong style="color: #ffffff;">"${reg.team.name}"</strong> আইপিএল ২০২৬ টুর্নামেন্টে যোগদানের আবেদন করেছে।</p>
            
            <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #1d3575; background: #0C1A40; border-radius: 8px; margin: 15px 0; font-size: 13px;">
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">প্রতিনিধি / ক্যাপ্টেন:</td><td style="color: #ffffff; font-weight: bold; border-bottom: 1px solid #1d3575;">${reg.team.representativeName}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">ফোন নম্বর:</td><td style="color: #ffffff; font-family: monospace; border-bottom: 1px solid #1d3575;">${reg.team.phone}</td></tr>
              <tr><td style="color: #94a3b8; border-bottom: 1px solid #1d3575;">খেলোয়াড় সংখ্যা:</td><td style="color: #ffffff; border-bottom: 1px solid #1d3575;">${reg.team.members.length} জন</td></tr>
              <tr><td style="color: #94a3b8;">UTR Ref / ফি:</td><td style="color: #F9A01B; font-weight: bold;">₹${reg.payment.amount} (${reg.payment.utr || 'N/A'})</td></tr>
            </table>

            <table align="center" style="margin: 20px auto;">
              <tr>
                <td style="background: #19398A; border-radius: 8px;">
                  <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; color: #ffffff; font-weight: bold; text-decoration: none;">
                    অ্যাডমিন প্যানেলে যাচাই করুন →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: reviewerEmails, subject, html });
}

// 3. Approval Email with Attached PDF Pass
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

  const downloadUrl = `${siteUrl}/api/passes/${pass.passId}/download`;
  const verifyUrl = `${siteUrl}/verify/${pass.passId}`;

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
    to: reg.team.email,
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
    ? `[জরুরি সংশোধন প্রয়োজন] "${reg.team.name}" - আইপিএল ২০২৬ নিবন্ধন`
    : `[নিবন্ধন আবেদন বাতিল] "${reg.team.name}" - আইপিএল ২০২৬ নিবন্ধন`;

  const editUrl = `${siteUrl}/my-registration?id=${reg.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px 0; background-color: #050D24; font-family: sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #08143A; border-radius: 16px; overflow: hidden; border: 1px solid #1d3575;">
        <tr><td height="5" style="background: ${isCorrection ? '#F9A01B' : '#e11d48'};"></td></tr>
        <tr>
          <td style="padding: 24px;">
            <h2 style="color: ${isCorrection ? '#F9A01B' : '#f43f5e'}; margin: 0 0 10px 0;">
              ${isCorrection ? 'নিবন্ধন তথ্যে সংশোধন প্রয়োজন' : 'নিবন্ধন আবেদনটি বাতিল করা হয়েছে'}
            </h2>
            <p style="color: #cbd5e1;">প্রিয় <strong>${reg.team.representativeName}</strong>,</p>
            <p style="color: #cbd5e1;">আপনার দল <strong>"${reg.team.name}"</strong> এর নিবন্ধন আবেদনের প্রেক্ষিতে অ্যাডমিন সিদ্ধান্ত:</p>
            
            <div style="background: #0C1A40; border-left: 4px solid ${isCorrection ? '#F9A01B' : '#f43f5e'}; padding: 12px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: bold;">অ্যাডমিন নোট / কারণ:</p>
              <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 14px;">${reason || 'অসম্পূর্ণ বা অপাঠ্য তথ্য।'}</p>
            </div>

            ${
              isCorrection
                ? `<table align="center" style="margin: 20px auto;">
                     <tr>
                       <td style="background: linear-gradient(90deg, #F26522, #F9A01B); border-radius: 8px;">
                         <a href="${editUrl}" style="display: inline-block; padding: 12px 24px; color: #050D24; font-weight: bold; text-decoration: none;">
                           তথ্য সংশোধন করুন →
                         </a>
                       </td>
                     </tr>
                   </table>`
                : ''
            }
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: reg.team.email, subject, html });
}
