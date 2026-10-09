import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { BilingualText, TeamPass } from '@/types';

const PASS_SIGNING_SECRET =
  process.env.PASS_SIGNING_SECRET || 'iswampur_secret_default_signing_key_2026';

export function generateSecurePassId(): { passId: string; humanPassCode: string } {
  const randomBytes = crypto.randomBytes(12).toString('hex');
  const passId = `pass_${randomBytes}`;
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const humanPassCode = `ISW-IPL26-${suffix}`;
  return { passId, humanPassCode };
}

export function computePassSignature(data: {
  passId: string;
  registrationId: string;
  teamName: string;
  eventId: string;
}): string {
  const payload = `${data.passId}:${data.registrationId}:${data.teamName}:${data.eventId}`;
  return crypto.createHmac('sha256', PASS_SIGNING_SECRET).update(payload).digest('hex');
}

export function verifyPassSignature(pass: TeamPass): boolean {
  if (!pass || !pass.signature) return false;
  const expected = computePassSignature({
    passId: pass.passId,
    registrationId: pass.registrationId,
    teamName: pass.teamName,
    eventId: pass.eventId,
  });
  const bufSig = Buffer.from(pass.signature);
  const bufExp = Buffer.from(expected);
  if (bufSig.length !== bufExp.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufSig, bufExp);
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#050D24', // IPL Midnight Navy
      light: '#ffffff',
    },
  });
}

function sanitizeForPdf(text?: string | null, fallback = ''): string {
  if (!text) return fallback;
  const matchParen = text.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1]) {
    const latin = matchParen[1].replace(/[^\x20-\x7E]/g, '').trim();
    if (latin) return latin;
  }
  const cleaned = text.replace(/[^\x20-\x7E]/g, '').trim();
  return cleaned || fallback;
}

export async function generatePassPdf(
  pass: TeamPass,
  options?: { siteUrl?: string }
): Promise<Uint8Array> {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const verifyUrl = `${siteUrl}/verify/${pass.passId}`;
  const qrDataUrl = await generateQrDataUrl(verifyUrl);
  const qrImageBytes = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

  // Create a clean PDF Document (A4 format: 595.28 x 841.89 points)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Load and embed official logo if available
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-horizontal-web.png');
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
  } catch (err) {
    console.error('Error embedding pass logo:', err);
  }

  // Official IPL color definitions
  const navyDark = rgb(0.02, 0.05, 0.14);    // #050D24
  const navyMid = rgb(0.03, 0.08, 0.23);     // #08143A
  const orangeFire = rgb(0.95, 0.40, 0.13);  // #F26522
  const goldTrophy = rgb(0.98, 0.63, 0.11);  // #F9A01B
  const blueElectric = rgb(0.0, 0.64, 0.88); // #00A3E0
  const bgLight = rgb(0.96, 0.98, 1.0);      // Soft ice white

  // Background decoration / page border
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: navyMid,
    borderWidth: 2,
    color: bgLight,
  });

  // Inner Gold Accent Frame
  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: goldTrophy,
    borderWidth: 1,
  });

  // Top IPL Stadium Header Banner
  const bannerHeight = 125;
  const bannerY = height - bannerHeight - 24;
  page.drawRectangle({
    x: 24,
    y: bannerY,
    width: width - 48,
    height: bannerHeight,
    color: navyMid,
  });

  // Top Fire Orange & Gold Accent Strip
  page.drawRectangle({
    x: 24,
    y: height - 28,
    width: width - 48,
    height: 4,
    color: orangeFire,
  });

  // Draw Logo in Header if available
  if (logoImage) {
    page.drawImage(logoImage, {
      x: 38,
      y: bannerY + 12,
      width: 145,
      height: 97,
    });
  }

  const textStartX = logoImage ? 195 : 45;

  page.drawText('ISWAMPUR PREMIER LEAGUE 2026', {
    x: textStartX,
    y: bannerY + 90,
    size: 17,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('OFFICIAL MATCHDAY SQUAD PASS & GROUND ENTRY', {
    x: textStartX,
    y: bannerY + 70,
    size: 10,
    font: fontBold,
    color: goldTrophy,
  });

  page.drawText('Digital Tournament Gate Authorization - Valid for Registered Players Only', {
    x: textStartX,
    y: bannerY + 54,
    size: 8,
    font: fontRegular,
    color: rgb(0.8, 0.88, 0.96),
  });

  // Prominent High-Contrast PASS CODE Badge Box in Header
  const passBoxWidth = 240;
  const passBoxX = width - passBoxWidth - 36;
  const passBoxY = bannerY + 12;

  page.drawRectangle({
    x: passBoxX,
    y: passBoxY,
    width: passBoxWidth,
    height: 38,
    color: goldTrophy,
    borderColor: rgb(1, 1, 1),
    borderWidth: 1.5,
  });

  page.drawText('PASS ID / PASS CODE:', {
    x: passBoxX + 12,
    y: passBoxY + 24,
    size: 8,
    font: fontBold,
    color: navyDark,
  });

  page.drawText(`${pass.humanPassCode}`, {
    x: passBoxX + 12,
    y: passBoxY + 7,
    size: 15,
    font: fontBold,
    color: navyDark,
  });

  // Card 1: Team & Tournament Information
  const cardY = bannerY - 240;
  page.drawRectangle({
    x: 36,
    y: cardY,
    width: width - 72,
    height: 225,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.9, 0.96),
    borderWidth: 1.5,
  });

  // Card Header Accent
  page.drawRectangle({
    x: 36,
    y: cardY + 190,
    width: width - 72,
    height: 35,
    color: navyDark,
  });

  page.drawText('REGISTERED TEAM SQUAD PARTICULARS', {
    x: 52,
    y: cardY + 202,
    size: 12,
    font: fontBold,
    color: goldTrophy,
  });

  const rowLabels = [
    { label: 'Team Name:', val: sanitizeForPdf(pass.teamName, 'Iswampur Squad'), isBold: true },
    { label: 'Representative / Captain:', val: sanitizeForPdf(pass.representativeName, 'Team Manager') },
    { label: 'Registered Squad Size:', val: `${pass.memberCount} Players Confirmed` },
    { label: 'Event / Tournament:', val: sanitizeForPdf(pass.eventTitle.en, sanitizeForPdf(pass.eventTitle.bn, 'Iswampur Premier League 2026')) },
    { label: 'Scheduled Dates:', val: sanitizeForPdf(pass.eventDate, 'December 20-25, 2026') },
    { label: 'Tournament Venue:', val: sanitizeForPdf(pass.venue.en, sanitizeForPdf(pass.venue.bn, 'Iswampur Central Sports Ground')) },
  ];

  let currentY = cardY + 160;
  rowLabels.forEach((row) => {
    page.drawText(row.label, {
      x: 52,
      y: currentY,
      size: 10,
      font: fontBold,
      color: navyMid,
    });

    page.drawText(row.val, {
      x: 230,
      y: currentY,
      size: row.isBold ? 11 : 10,
      font: row.isBold ? fontBold : fontRegular,
      color: row.isBold ? orangeFire : rgb(0.15, 0.15, 0.2),
    });

    currentY -= 26;
  });

  // Card 2: Digital Verification QR & Security Badging
  const qrSectionY = cardY - 245;
  page.drawRectangle({
    x: 36,
    y: qrSectionY,
    width: width - 72,
    height: 230,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.9, 0.96),
    borderWidth: 1.5,
  });

  // Draw QR code with dark navy border frame
  page.drawRectangle({
    x: 52,
    y: qrSectionY + 22,
    width: 185,
    height: 185,
    color: rgb(0.98, 0.99, 1),
    borderColor: navyMid,
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: 57,
    y: qrSectionY + 27,
    width: 175,
    height: 175,
  });

  const qrTextX = 255;

  page.drawText('INSTANT SMARTPHONE GATE VERIFICATION', {
    x: qrTextX,
    y: qrSectionY + 185,
    size: 11,
    font: fontBold,
    color: navyMid,
  });

  page.drawText('Scan QR with any smartphone to open the live server verification page.', {
    x: qrTextX,
    y: qrSectionY + 168,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.5),
  });

  // Prominent Pass ID Box
  page.drawRectangle({
    x: qrTextX,
    y: qrSectionY + 115,
    width: width - 72 - 255 - 20,
    height: 42,
    color: rgb(0.94, 0.97, 1),
    borderColor: blueElectric,
    borderWidth: 1,
  });

  page.drawText('UNIQUE PASS ID (FOR GROUND DATABASE):', {
    x: qrTextX + 10,
    y: qrSectionY + 142,
    size: 7.5,
    font: fontBold,
    color: navyMid,
  });

  page.drawText(`${pass.humanPassCode} (${pass.passId})`, {
    x: qrTextX + 10,
    y: qrSectionY + 125,
    size: 9.5,
    font: fontBold,
    color: orangeFire,
  });

  page.drawText(`Issued: ${new Date(pass.issuedAt).toLocaleDateString()}`, {
    x: qrTextX,
    y: qrSectionY + 95,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45),
  });

  page.drawText(`Cryptographic Signature: ${pass.signature.substring(0, 28)}...`, {
    x: qrTextX,
    y: qrSectionY + 78,
    size: 8,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Entry Status Banner
  page.drawRectangle({
    x: qrTextX,
    y: qrSectionY + 35,
    width: 240,
    height: 28,
    color: rgb(0.9, 0.98, 0.92),
    borderColor: rgb(0.1, 0.65, 0.3),
    borderWidth: 1,
  });

  page.drawText('STATUS: OFFICIAL CONFIRMED ENTRY', {
    x: qrTextX + 12,
    y: qrSectionY + 44,
    size: 10,
    font: fontBold,
    color: rgb(0.08, 0.5, 0.22),
  });

  // Bottom Notice: Official Ground Entry Rules
  const noticeY = 40;
  page.drawRectangle({
    x: 36,
    y: noticeY,
    width: width - 72,
    height: 95,
    color: rgb(0.96, 0.97, 1),
    borderColor: navyMid,
    borderWidth: 1,
  });

  page.drawText('OFFICIAL MATCHDAY SECURITY & GROUND REGULATIONS:', {
    x: 52,
    y: noticeY + 76,
    size: 9.5,
    font: fontBold,
    color: navyMid,
  });

  page.drawText('1. Print this official pass or present the high-resolution digital pass upon arriving at the ground gate.', {
    x: 52,
    y: noticeY + 58,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.35),
  });

  page.drawText('2. All squad members must carry valid government/school photo identification matching registered roster names.', {
    x: 52,
    y: noticeY + 42,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.35),
  });

  page.drawText('3. QR code will be scanned at ground entry. Any counterfeit or duplicate pass attempt leads to immediate team disqualification.', {
    x: 52,
    y: noticeY + 26,
    size: 8,
    font: fontBold,
    color: orangeFire,
  });

  page.drawText('Issued by: Iswampur Tournament Committee & Village Council | Contact: support@iswampur.in', {
    x: 52,
    y: noticeY + 12,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55),
  });

  return await pdfDoc.save();
}
