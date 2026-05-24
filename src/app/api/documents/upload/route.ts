export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Lead } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { leadId, fileName, fileType, fileData, fileSize, currentUser } = body;

    if (!fileName || !fileData) {
      return NextResponse.json({ success: false, error: 'FileName and FileData are required' }, { status: 400 });
    }

    // Decode base64 file data
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Create public/uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    const documentRecord = {
      name: fileName,
      size: fileSize || `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      url: publicUrl,
      uploadedAt: new Date()
    };

    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }

      lead.documents.push(documentRecord);
      lead.history.push({
        event: `Uploaded Document: ${fileName}`,
        user: currentUser || 'System',
        time: new Date()
      });
      await lead.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully!',
      document: documentRecord
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
