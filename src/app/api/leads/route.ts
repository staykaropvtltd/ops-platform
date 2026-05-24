export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Lead, User } from '@/lib/db';
import { logActivity } from '@/lib/activity';

// GET all leads
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const lead = await Lead.findById(id);
      if (!lead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, lead });
    }

    const leads = await Lead.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST new lead
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, company, value, stage, status, email, phone, assignedTo } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
    }

    let assignedToName = 'Unassigned';
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (user) assignedToName = user.name;
    }

    const history = [{
      event: 'Lead Created',
      user: assignedToName !== 'Unassigned' ? assignedToName : 'System',
      time: new Date()
    }];

    const lead = await Lead.create({
      name,
      company: company || 'Acme Corp',
      value: value || '$0',
      stage: stage || 'Discovery',
      status: status || 'Warm',
      email,
      phone: phone || '',
      assignedTo: assignedTo || null,
      assignedToName,
      history,
      notes: [],
      emails: []
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT (update lead / notes / pipeline stage / email sequences / assignment)
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, action, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const currentUser = data.currentUser || 'System';

    if (action === 'update_stage') {
      const oldStage = lead.stage;
      lead.stage = data.stage;
      lead.history.push({
        event: `Stage changed: ${oldStage} → ${data.stage}`,
        user: currentUser,
        time: new Date()
      });
      lead.lastContact = 'Just now';
      await lead.save();
    } else if (action === 'add_note') {
      lead.notes.push({
        content: data.content,
        author: currentUser,
        createdAt: new Date()
      });
      lead.history.push({
        event: `Added note: "${data.content.substring(0, 30)}..."`,
        user: currentUser,
        time: new Date()
      });
      await lead.save();
    } else if (action === 'assign_lead') {
      let assignedName = 'Unassigned';
      if (data.assignedTo) {
        const user = await User.findById(data.assignedTo);
        if (user) assignedName = user.name;
      }
      lead.assignedTo = data.assignedTo || null;
      lead.assignedToName = assignedName;
      lead.history.push({
        event: `Lead assigned to ${assignedName}`,
        user: currentUser,
        time: new Date()
      });
      await lead.save();
    } else if (action === 'update_details') {
      lead.name = data.name || lead.name;
      lead.company = data.company || lead.company;
      lead.value = data.value || lead.value;
      lead.status = data.status || lead.status;
      lead.email = data.email || lead.email;
      lead.phone = data.phone || lead.phone;
      lead.history.push({
        event: `Lead details updated`,
        user: currentUser,
        time: new Date()
      });
      await lead.save();
    } else {
      // General save
      Object.assign(lead, data);
      await lead.save();
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE lead
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lead successfully deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
