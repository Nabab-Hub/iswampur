import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PostAnnouncement } from '@/types';

function sanitizeForPdf(text?: string | null, fallback = ''): string {
  if (!text) return fallback;
  // If text contains parenthesis with English/Latin, extract that
  const matchParen = text.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1]) {
    const latin = matchParen[1].replace(/[^\x20-\x7E]/g, '').trim();
    if (latin) return latin;
  }
  // Strip non-ASCII for Helvetica standard font
  const cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
  return cleaned || fallback;
}

function wrapText(text: string, maxCharsPerLine = 75): string[] {
  const paragraphs = text.split('\n');
  const resultLines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      resultLines.push('');
      continue;
    }

    const words = trimmed.split(' ');
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        if (currentLine) resultLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) resultLines.push(currentLine);
  }

  return resultLines;
}

export async function generateNoticePdf(
  notice: PostAnnouncement,
  options?: { siteUrl?: string }
): Promise<Uint8Array> {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Standard A4: 595.28 x 841.89 points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Load official horizontal logo
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-horizontal-web.png');
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
  } catch (err) {
    console.error('Error embedding notice logo:', err);
  }

  // Official color palette (matching pass generator)
  const navyDark = rgb(0.02, 0.05, 0.14);    // #050D24
  const navyMid = rgb(0.03, 0.08, 0.23);     // #08143A
  const orangeFire = rgb(0.95, 0.40, 0.13);  // #F26522
  const goldTrophy = rgb(0.98, 0.63, 0.11);  // #F9A01B
  const blueElectric = rgb(0.0, 0.64, 0.88); // #00A3E0
  const bgLight = rgb(0.98, 0.99, 1.0);      // Crisp soft white
  const slateText = rgb(0.2, 0.25, 0.35);    // Body text color
  const lightGrey = rgb(0.91, 0.93, 0.96);   // Border/rule

  // 1. Page Background & Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: navyMid,
    borderWidth: 2,
    color: bgLight,
  });

  // Inner Gold Accent Frame
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: goldTrophy,
    borderWidth: 1,
  });

  // 2. Official Header Banner (Navy)
  const headerHeight = 115;
  const headerY = height - headerHeight - 26;

  page.drawRectangle({
    x: 26,
    y: headerY,
    width: width - 52,
    height: headerHeight,
    color: navyMid,
  });

  // Top Fire Orange & Gold Accent Strip
  page.drawRectangle({
    x: 26,
    y: height - 30,
    width: width - 52,
    height: 4,
    color: orangeFire,
  });

  // Logo in Header
  if (logoImage) {
    page.drawImage(logoImage, {
      x: 40,
      y: headerY + 14,
      width: 130,
      height: 87,
    });
  }

  const textStartX = logoImage ? 185 : 45;

  page.drawText('ISWAMPUR VILLAGE DIGITAL PLATFORM', {
    x: textStartX,
    y: headerY + 84,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('OFFICIAL NOTICE & PUBLIC CIRCULAR', {
    x: textStartX,
    y: headerY + 66,
    size: 11,
    font: fontBold,
    color: goldTrophy,
  });

  page.drawText('Office of the General Secretary & Village Management Committee', {
    x: textStartX,
    y: headerY + 50,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.98),
  });

  page.drawText('Gram Panchayat Area | Iswampur High School Ground Complex | West Bengal', {
    x: textStartX,
    y: headerY + 36,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.68, 0.78, 0.92),
  });

  // Memo No. & Date Reference Bar
  const refBarY = headerY - 34;
  page.drawRectangle({
    x: 26,
    y: refBarY,
    width: width - 52,
    height: 30,
    color: lightGrey,
  });

  const memoNumber = notice.memoNo || `ISW/NOT/${new Date().getFullYear()}/${notice.id.slice(-4).toUpperCase()}`;
  const noticeDate = notice.date || new Date(notice.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  page.drawText(`MEMO NO: ${memoNumber}`, {
    x: 42,
    y: refBarY + 10,
    size: 9.5,
    font: fontBold,
    color: navyDark,
  });

  page.drawText(`DATE: ${noticeDate}`, {
    x: width - 180,
    y: refBarY + 10,
    size: 9.5,
    font: fontBold,
    color: navyDark,
  });

  // Category Badge Box
  const catLabel = (notice.category || 'NOTICE').toUpperCase();
  const catText = notice.category === 'urgent' ? 'URGENT NOTIFICATION' : `${catLabel} CIRCULAR`;
  const badgeWidth = 140;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = refBarY - 26;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: 20,
    color: notice.category === 'urgent' ? orangeFire : navyMid,
  });

  const badgeTextX = badgeX + (badgeWidth - (catText.length * 5.8)) / 2;
  page.drawText(catText, {
    x: Math.max(badgeX + 6, badgeTextX),
    y: badgeY + 6,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Subject Box
  const subjBoxY = badgeY - 55;
  page.drawRectangle({
    x: 36,
    y: subjBoxY,
    width: width - 72,
    height: 44,
    color: rgb(0.94, 0.96, 1.0),
    borderColor: blueElectric,
    borderWidth: 1,
  });

  page.drawText('TITLE:', {
    x: 48,
    y: subjBoxY + 28,
    size: 8,
    font: fontBold,
    color: blueElectric,
  });

  // Strict ASCII sanitization for standard PDF fonts
  const rawTitle = notice.title?.en || notice.title?.bn || 'Official Notice Announcement';
  const englishTitle = sanitizeForPdf(rawTitle, 'Official Notice Announcement');
  page.drawText(englishTitle.length > 70 ? englishTitle.substring(0, 67) + '...' : englishTitle, {
    x: 48,
    y: subjBoxY + 10,
    size: 11,
    font: fontBold,
    color: navyDark,
  });

  // Main Notice Content Area
  const bodyStartY = subjBoxY - 25;
  const rawContent = notice.content?.en || notice.content?.bn || 'Official notification details available on portal.';
  const englishContent = sanitizeForPdf(rawContent, 'Please refer to the village portal for full details.');
  const wrappedLines = wrapText(englishContent, 74);

  let currentY = bodyStartY;
  page.drawText('TO ALL VILLAGERS, RESIDENTS & CONCERNED CITIZENS:', {
    x: 40,
    y: currentY,
    size: 9,
    font: fontBold,
    color: navyDark,
  });

  currentY -= 18;

  for (const line of wrappedLines) {
    if (currentY < 60) break;
    if (line === '') {
      currentY -= 8;
      continue;
    }
    const cleanLine = sanitizeForPdf(line);
    if (!cleanLine) continue;
    page.drawText(cleanLine, {
      x: 40,
      y: currentY,
      size: 9.5,
      font: fontRegular,
      color: slateText,
    });
    currentY -= 15;
  }

  // Fixed Page Bottom Note
  page.drawText('* Note: Original bilingual edition published digitally on Iswampur Web Portal.', {
    x: 40,
    y: 36,
    size: 7.5,
    font: fontOblique,
    color: rgb(0.5, 0.55, 0.65),
  });

  return await pdfDoc.save();
}
