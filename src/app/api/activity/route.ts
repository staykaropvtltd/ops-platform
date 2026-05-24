export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity';

export async function POST(req: NextRequest) {
  try {
    const { userId, actionType, description, metadata } = await req.json();

    if (!userId || !actionType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const log = await logActivity({
      userId,
      actionType,
      description,
      metadata,
      req
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
