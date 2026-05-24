import mongoose, { Schema, model, models } from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}
const cached: MongooseCache = global._mongoose;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// --- MODELS ---

// 1. Users
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Staff', 'User'], default: 'User' },
  firstLogin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

// 2. Activity Logs
const ActivityLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  userRole: String,
  actionType: { type: String, required: true }, // login, download, upload, task, etc.
  description: String,
  metadata: Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// 3. Email Logs (Already existed, refined)
const EmailLogSchema = new Schema({
  event: { type: String, required: true },
  to: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  messageId: String,
  error: String,
  vars: Schema.Types.Mixed,
  sentAt: { type: Date, default: Date.now }
});

// 4. Notifications
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 5. Leads
const LeadSchema = new Schema({
  name: { type: String, required: true },
  company: { type: String, default: 'Acme Corp' },
  value: { type: String, default: '$0' },
  stage: { type: String, enum: ['Discovery', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closing'], default: 'Discovery' },
  status: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm' },
  lastContact: { type: String, default: 'Just now' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String, default: 'Unassigned' },
  notes: [{
    content: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }],
  emails: [{
    subject: String,
    body: String,
    sender: String,
    sentAt: { type: Date, default: Date.now },
    scheduledAt: Date,
    status: { type: String, enum: ['sent', 'scheduled', 'opened', 'clicked', 'replied'], default: 'sent' },
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }],
  documents: [{
    name: String,
    size: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  history: [{
    event: String,
    user: String,
    time: { type: Date, default: Date.now }
  }],
  activeSequence: { type: String, default: '' },
  sequenceStep: { type: Number, default: 0 },
  sequenceEnrolledAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// 6. Invoices
const InvoiceSchema = new Schema({
  invoiceId: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  amount: { type: String, required: true },
  date: { type: String, required: true },
  due: { type: String, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  category: { type: String, default: 'Consulting' },
  paymentLink: { type: String, default: '' },
  remindersCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 7. Email Templates
const EmailTemplateSchema = new Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 8. Sequences
const SequenceSchema = new Schema({
  name: { type: String, required: true, unique: true },
  steps: [{
    stepNumber: Number,
    delayDays: Number,
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    subject: String,
    body: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export const User = models.User || model('User', UserSchema);
export const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);
export const EmailLog = models.EmailLog || model('EmailLog', EmailLogSchema);
export const Notification = models.Notification || model('Notification', NotificationSchema);
export const Lead = models.Lead || model('Lead', LeadSchema);
export const Invoice = models.Invoice || model('Invoice', InvoiceSchema);
export const EmailTemplate = models.EmailTemplate || model('EmailTemplate', EmailTemplateSchema);
export const Sequence = models.Sequence || model('Sequence', SequenceSchema);

