export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    await connectDB();

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    // 3. Handle First Login Logic
    if (user.firstLogin) {
      // Send Welcome to User
      await sendEmail({
        event: 'welcome',
        to: user.email,
        vars: { name: user.name, role: user.role }
      }).catch(console.error);

      // Send Notification to Admin
      await sendEmail({
        event: 'admin_user_signup',
        to: "vaishnavioz226@gmail.com", // Admin Email
        vars: { name: user.name, email: user.email, role: user.role }
      }).catch(console.error);

      // Update User
      user.firstLogin = false;
    }

    user.lastLogin = new Date();
    await user.save();

    // 4. Log Activity
    await logActivity({
      userId: user._id,
      actionType: 'login',
      description: `User logged in as ${user.role}`,
      req
    });

    // In a real app, we'd set a JWT/Session cookie here. 
    // For this implementation, we return user data for the frontend to manage state.
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
