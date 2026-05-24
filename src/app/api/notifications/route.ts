export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Notification } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, action } = body;

    if (action === 'mark_all_read') {
      await Notification.updateMany({ read: false }, { read: true });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { read: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
