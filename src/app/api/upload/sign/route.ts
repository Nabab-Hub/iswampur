import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { folder = 'iswampur_uploads' } = await req.json();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Return simulated upload response so developers can test immediately without Cloudinary account
      const simulatedUrl = `https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80`;
      return NextResponse.json({
        mock: true,
        url: simulatedUrl,
        publicId: `mock_${Date.now()}`,
        message: 'Cloudinary credentials not set in .env.local. Using sample asset URL.',
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error('Upload sign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
