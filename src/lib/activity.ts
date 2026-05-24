import { connectDB, ActivityLog, User } from './db';
import { sendDualNotification } from './email';

type LogActivityParams = {
  userId: string;
  actionType: string;
  description: string;
  metadata?: Record<string, unknown>;
  req?: Request;
};

export async function logActivity({ userId, actionType, description, metadata = {}, req }: LogActivityParams) {
  await connectDB();

  // 1. Get User info
  const user = await User.findById(userId);
  if (!user) return;

  // 2. Create Activity Log
  const log = await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    userRole: user.role,
    actionType,
    description,
    metadata,
    ip: req?.headers.get('x-forwarded-for') || '127.0.0.1',
    userAgent: req?.headers.get('user-agent') || 'Unknown'
  });

  // 3. Trigger Dual Notifications if it's a significant action
      const significantActions = [
      'file_download', 'report_generation', 'task_update', 
      'workflow_action', 'upload', 'ticket_update', 'export_csv', 'new_project'
    ];

  if (significantActions.includes(actionType)) {
    // sendDualNotification internally calls sendEmail which logs to EmailLog
    await sendDualNotification({
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: actionType.replace(/_/g, ' ').toUpperCase(),
      description
    }).catch(console.error);
  }

  return log;
}
