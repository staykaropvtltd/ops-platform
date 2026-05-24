import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { parse } from 'json2csv';

// Dummy data fetch – replace with real DB query
async function fetchData() {
  // Example data array of objects
  return [
    { id: 1, name: 'Project A', status: 'Active' },
    { id: 2, name: 'Project B', status: 'Completed' },
  ];
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const data = await fetchData();
    const csv = parse(data);

    // Log activity – use a placeholder userId (in real case, extract from auth token)
    const placeholderUserId = (await User.findOne({ email: 'placeholder@example.com' }))?._id;
    if (placeholderUserId) {
      await logActivity({
        userId: placeholderUserId,
        actionType: 'export_csv',
        description: 'User exported project data as CSV',
        metadata: { recordCount: data.length },
        req,
      });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="projects.csv"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ---------------------------------------------------
// New Project creation endpoint (POST /api/projects)
// ---------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    await connectDB();
    // Here you would actually create the project in DB – omitted for brevity
    const newProject = { _id: 'proj_' + Date.now(), name, description };

    // Log activity for project creation
    const placeholderUserId = (await User.findOne({ email: 'placeholder@example.com' }))?._id;
    if (placeholderUserId) {
      await logActivity({
        userId: placeholderUserId,
        actionType: 'new_project',
        description: `Created project ${name}`,
        metadata: { projectId: newProject._id },
        req,
      });
    }

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
