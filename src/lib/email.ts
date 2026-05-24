import nodemailer from 'nodemailer';
import { connectDB, EmailLog } from './db';

type TemplateVars = Record<string, string>;

type EmailTemplate = {
  subject: string;
  html: (vars: TemplateVars) => string;
};

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to Antigravity OPS Platform',
    html: (vars: TemplateVars) => `
      <div style="background: #0a0a0a; color: #ffffff; padding: 40px; font-family: sans-serif;">
        <h1 style="color: #10b981;">Welcome, ${vars.name}!</h1>
        <p>Your account has been successfully created with the role of <strong>${vars.role}</strong>.</p>
        <p>This is your first time logging in. We are excited to have you!</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Antigravity Enterprise Operations</p>
      </div>
    `
  },
  invitation: {
    subject: 'Workspace Invitation - Antigravity OPS',
    html: (vars: TemplateVars) => `
      <div style="background: #0a0a0a; color: #ffffff; padding: 40px; font-family: sans-serif;">
        <h2 style="color: #4f46e5;">You've been invited!</h2>
        <p>You have been invited to join the Antigravity OPS platform as a <strong>${vars.role}</strong>.</p>
        <p>Please use this email address to register your account.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Join Workspace</a>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
      </div>
    `
  },
  admin_user_signup: {
    subject: 'Alert: New User Registration',
    html: (vars: TemplateVars) => `
      <div style="background: #0a0a0a; color: #ffffff; padding: 40px; font-family: sans-serif; border: 1px solid #333;">
        <h2 style="color: #ef4444;">Admin Notification: New User</h2>
        <p>A new user has registered/logged in for the first time.</p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Name:</strong> ${vars.name}</li>
          <li><strong>Email:</strong> ${vars.email}</li>
          <li><strong>Role:</strong> ${vars.role}</li>
          <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
      </div>
    `
  },
  activity_alert: {
    subject: 'Activity Notification',
    html: (vars: TemplateVars) => `
      <div style="background: #0a0a0a; color: #ffffff; padding: 40px; font-family: sans-serif;">
        <h3 style="color: #10b981;">Activity Detected: ${vars.action}</h3>
        <p><strong>User:</strong> ${vars.name} (${vars.role})</p>
        <p><strong>Detail:</strong> ${vars.description}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
      </div>
    `
  }
};

export async function sendEmail({ event, to, vars }: { event: keyof typeof TEMPLATES; to: string; vars: TemplateVars }) {
  const transporter = getTransporter();
  const template = TEMPLATES[event];
  if (!template) throw new Error(`Template not found for event: ${event}`);

  try {
    // Ensure DB connection for logging
    await connectDB();

    const info = await transporter.sendMail({
      from: `"Antigravity OPS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html(vars),
    });

    // Log success – failure to log should not stop email delivery
    try {
      await EmailLog.create({
        event,
        to,
        status: 'success',
        messageId: info.messageId,
        vars,
      });
    } catch (logErr) {
      console.error('EmailLog (success) failed:', logErr);
    }

    return info;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Log failure – also non‑blocking
    try {
      await EmailLog.create({
        event,
        to,
        status: 'failed',
        error: message,
        vars,
      });
    } catch (logErr) {
      console.error('EmailLog (failure) failed:', logErr);
    }
    throw error;
  }
}

/**
 * Sends notification to both the user and the administrator.
 */
export async function sendDualNotification({ userEmail, userName, userRole, action, description }: { userEmail: string; userName: string; userRole: string; action: string; description: string; }) {
  const adminEmail = "vaishnavioz226@gmail.com"; 
  
  // 1. Send to User
  await sendEmail({
    event: 'activity_alert',
    to: userEmail,
    vars: { name: userName, role: userRole, action, description }
  }).catch(console.error);

  // 2. Send to Admin
  await sendEmail({
    event: 'activity_alert',
    to: adminEmail,
    vars: { name: userName, role: userRole, action, description }
  }).catch(console.error);
}
