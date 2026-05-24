export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Lead, EmailLog } from '@/lib/db';
import { getTransporter } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { leadId, to, subject, htmlContent, scheduledAt, sequenceName } = body;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ success: false, error: 'Recipient, Subject and Body are required' }, { status: 400 });
    }

    const lead = leadId ? await Lead.findById(leadId) : null;

    // Email logging ID
    const emailId = Math.random().toString(36).substring(7);

    // Inject Email Tracking (Open Pixel and Link Tracking)
    const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/tracking?id=${emailId}&leadId=${leadId || ''}&type=open" width="1" height="1" style="display:none;" />`;
    
    // Simple links replacement to track click (replace href="http..." with track redirect)
    let processedHtml = htmlContent + trackingPixel;
    const trackingBaseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/tracking?id=${emailId}&leadId=${leadId || ''}&type=click&redirect=`;
    
    processedHtml = processedHtml.replace(/href="([^"]+)"/g, (match: string, url: string) => {
      // Don't track mailto or local paths
      if (url.startsWith('mailto:') || url.startsWith('/') || url.startsWith('#')) return match;
      return `href="${trackingBaseUrl}${encodeURIComponent(url)}"`;
    });

    const emailStatus = scheduledAt ? 'scheduled' : 'sent';
    const emailRecord = {
      subject,
      body: htmlContent,
      sender: process.env.SENDER_EMAIL || 'vaishnavioz226@gmail.com',
      sentAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: emailStatus,
      opens: 0,
      clicks: 0
    };

    if (lead) {
      lead.emails.push(emailRecord);
      lead.history.push({
        event: scheduledAt ? `Email Scheduled: "${subject}"` : `Email Sent: "${subject}"`,
        user: 'System',
        time: new Date()
      });
      lead.lastContact = 'Just now';
      
      if (sequenceName) {
        lead.activeSequence = sequenceName;
        lead.sequenceStep = 1;
        lead.sequenceEnrolledAt = new Date();
      }

      await lead.save();
    }

    if (!scheduledAt) {
      // Send Real Email!
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Antigravity OPS" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html: processedHtml
      });

      // Save global EmailLog
      await EmailLog.create({
        event: 'composed_email',
        to,
        status: 'success',
        messageId: emailId,
        vars: { subject }
      });
    }

    return NextResponse.json({
      success: true,
      message: scheduledAt ? 'Email scheduled successfully!' : 'Email transmitted successfully!',
      email: emailRecord
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
