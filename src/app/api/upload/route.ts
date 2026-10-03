import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, sanitizedName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${sanitizedName}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileSizeStr = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${Math.round(file.size / 1024)} KB`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: fileSizeStr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
