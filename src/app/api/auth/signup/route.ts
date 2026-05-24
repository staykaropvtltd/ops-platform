export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    // 1. Validate Role (Requirement: ONLY ONE Admin, no self-register as Admin)
    if (role === 'Admin') {
      return NextResponse.json({ success: false, error: 'Direct registration as Admin is forbidden.' }, { status: 403 });
    }

    const allowedRoles = ['Manager', 'Staff', 'User'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role selected.' }, { status: 400 });
    }

    await connectDB();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 400 });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create User
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      firstLogin: true
    });

    // Send immediate welcome email to user
    await sendEmail({
      event: 'welcome',
      to: user.email,
      vars: { name: user.name, role: user.role }
    }).catch(console.error);

    // Notify Admin of new registration
    await sendEmail({
      event: 'admin_user_signup',
      to: "vaishnavioz226@gmail.com", 
      vars: { name: user.name, email: user.email, role: user.role }
    }).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully. Please login.' 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
