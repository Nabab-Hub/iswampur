import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const folder = (formData.get('folder') as string) || 'iswampur_uploads';
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        try {
          const res = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder,
                resource_type: 'auto',
              },
              (error, result) => {
                if (error || !result) {
                  reject(error || new Error('Upload failed'));
                } else {
                  resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                  });
                }
              }
            );
            stream.end(buffer);
          });
          return res;
        } catch (cloudErr) {
          console.warn('Cloudinary upload failed, falling back to data URL:', cloudErr);
        }
      }

      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      return {
        url: `data:${mimeType};base64,${base64}`,
        publicId: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
    });

    const results = await Promise.all(uploadPromises);

    if (results.length === 1) {
      return NextResponse.json({
        success: true,
        url: results[0].url,
        publicId: results[0].publicId,
        files: results,
      });
    }

    return NextResponse.json({
      success: true,
      files: results,
      urls: results.map((r) => r.url),
    });
  } catch (error: any) {
    console.error('Direct Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
