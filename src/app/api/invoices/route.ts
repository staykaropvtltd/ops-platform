import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Invoice } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

// GET all invoices
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST new invoice
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { client, amount, category, due, date } = body;

    if (!client || !amount) {
      return NextResponse.json({ success: false, error: 'Client and Amount are required' }, { status: 400 });
    }

    const invoiceId = `INV-${Math.floor(Math.random() * 900) + 100}`;
    const paymentLink = `https://pay.opsplatform.io/${invoiceId}`;

    const newInvoice = await Invoice.create({
      invoiceId,
      client,
      amount,
      category: category || 'Consulting',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      due: due || 'Next Month',
      status: 'Pending',
      paymentLink,
      remindersCount: 0
    });

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT (approve payment status, send manual payment reminders, generate payment links)
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, action, status, clientEmail } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    if (action === 'approve') {
      invoice.status = 'Paid';
      await invoice.save();
      return NextResponse.json({ success: true, invoice });
    }

    if (action === 'send_reminder') {
      // Increment reminders
      invoice.remindersCount += 1;
      await invoice.save();

      // Trigger reminder email if email is provided
      if (clientEmail) {
        try {
          await sendEmail({
            event: 'activity_alert', // use activity alert as a generic template or default template
            to: clientEmail,
            vars: {
              name: invoice.client,
              role: 'Client',
              action: `Payment Reminder: Invoice ${invoice.invoiceId}`,
              description: `This is a reminder that your invoice ${invoice.invoiceId} for ${invoice.amount} is outstanding. Due date: ${invoice.due}. Please pay here: ${invoice.paymentLink}`
            }
          });
        } catch (mailErr) {
          console.error('Failed to send email reminder:', mailErr);
        }
      }

      return NextResponse.json({ success: true, invoice });
    }

    // Direct update
    if (status) {
      invoice.status = status;
      await invoice.save();
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE invoice
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Invoice successfully deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
