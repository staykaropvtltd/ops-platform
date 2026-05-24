import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Lead } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { csvData, currentUser } = body;

    if (!csvData) {
      return NextResponse.json({ success: false, error: 'No CSV data provided' }, { status: 400 });
    }

    // Split by lines
    const lines = csvData.split(/\r?\n/);
    if (lines.length <= 1) {
      return NextResponse.json({ success: false, error: 'CSV file is empty or missing headers' }, { status: 400 });
    }

    // Parse headers
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const companyIdx = headers.indexOf('company');
    const valueIdx = headers.indexOf('value');
    const stageIdx = headers.indexOf('stage');
    const statusIdx = headers.indexOf('status');
    const phoneIdx = headers.indexOf('phone');

    if (nameIdx === -1 || emailIdx === -1) {
      return NextResponse.json({
        success: false,
        error: 'CSV must contain at least "name" and "email" headers'
      }, { status: 400 });
    }

    const createdLeads = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split line accounting for potential quotes
      // simple quote parser for csv
      const cols = [];
      let currentVal = '';
      let insideQuote = false;
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          cols.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      cols.push(currentVal.trim());

      const name = cols[nameIdx];
      const email = cols[emailIdx];

      if (!name || !email) continue;

      const company = companyIdx !== -1 ? cols[companyIdx] : 'Acme Corp';
      const value = valueIdx !== -1 ? cols[valueIdx] : '$5,000';
      const stage = stageIdx !== -1 ? cols[stageIdx] : 'Discovery';
      const status = statusIdx !== -1 ? cols[statusIdx] : 'Warm';
      const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';

      const history = [{
        event: 'Lead Imported via CSV',
        user: currentUser || 'System',
        time: new Date()
      }];

      const newLead = await Lead.create({
        name,
        email,
        company,
        value,
        stage,
        status,
        phone,
        history,
        notes: [],
        emails: []
      });

      createdLeads.push(newLead);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdLeads.length} leads!`,
      count: createdLeads.length
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
