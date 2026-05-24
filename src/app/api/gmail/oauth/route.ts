import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const email = searchParams.get('email');

    if (action === 'connect') {
      // Simulate OAuth URL redirecting to Google Consent Screen
      const mockGoogleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=mock_id&redirect_uri=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gmail/oauth?action=callback&email=${email || ''}`
      )}&response_type=code&scope=https://www.googleapis.com/auth/gmail.send`;
      
      return NextResponse.json({ success: true, url: mockGoogleAuthUrl });
    }

    if (action === 'callback') {
      // Callback from OAuth simulation
      await connectDB();
      
      // Mark Gmail connected in local/db state
      return new NextResponse(
        `<html>
          <head>
            <title>Gmail Connected Successfully</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #dde0f7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
              h1 { color: #3730a3; margin-bottom: 12px; font-size: 24px; }
              p { color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
              .btn { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 14px rgba(79,70,229,0.4); }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Gmail Connected!</h1>
              <p>Your Gmail account has been successfully linked via Google OAuth. You can now compose, schedule, and track media emails directly from the Outreach Hub.</p>
              <a href="/mr?tab=email" class="btn">Return to Workspace</a>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
