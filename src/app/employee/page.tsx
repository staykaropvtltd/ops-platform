'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  CheckSquare, Clock, TrendingUp, MessageSquare, Star, CheckCircle, 
  Pause, Play, RotateCcw, MoreHorizontal, Send, Save, BarChart3, 
  Plus, ChevronRight, X, Paperclip, Check, ListChecks, HelpCircle, Bell, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SharedSettingsModule from '@/components/SharedSettingsModule';

// --- Reusable Components ---

const Card = ({ children, className = "", delay = 0, onClick }: { children: React.ReactNode, className?: string, delay?: number, onClick?: () => void }) => {
  const hasBg = className.split(' ').some(c => c.startsWith('bg-'));
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={onClick}
      className={`${hasBg ? "" : "bg-surface"} border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-all ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
};

const Badge = ({ text, type = "default" }: { text: string, type?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const styles = {
    default: "bg-base text-secondary border-border",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
    warning: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400",
    danger: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400",
    info: "bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-indigo-300"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${styles[type]}`}>
      {text}
    </span>
  );
};

// --- Interfaces ---

interface TaskLog {
  time: string;
  note: string;
  author: string;
}

interface SubTask {
  title: string;
  done: boolean;
}

interface EmployeeTask {
  id: number;
  title: string;
  desc: string;
  due: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'To Do' | 'In Progress' | 'Under Review' | 'Done' | 'Blocked';
  progress: number;
  estimatedHours: number;
  completed: boolean;
  subtasks: SubTask[];
  attachments: string[];
  logs: TaskLog[];
}

// --- Sub-Modules ---

const WorkspaceModule = ({ tasks, onFullSchedule, onOpenTask }: { tasks: EmployeeTask[]; onFullSchedule: () => void; onOpenTask: (task: EmployeeTask) => void }) => {
  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-primary">Assigned Initiatives</h3>
            <p className="text-[11px] text-secondary font-medium mt-0.5">High priority tasks requiring operational clearance.</p>
          </div>
          <button onClick={onFullSchedule} className="text-xs font-bold text-accent uppercase tracking-wider hover:underline flex items-center gap-1">
             Full Schedule <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {activeTasks.length > 0 ? activeTasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onOpenTask(task)}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border bg-base/30 hover:border-accent/30 hover:bg-base/60 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-base border border-border flex items-center justify-center shrink-0 text-indigo-500 font-extrabold text-sm group-hover:bg-accent/5">
                  #{task.id}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary group-hover:text-accent transition-colors">{task.title}</h4>
                  <div className="flex gap-2 items-center mt-2 flex-wrap">
                    <Badge text={task.priority} type={task.priority === 'Critical' ? 'danger' : task.priority === 'High' ? 'warning' : 'info'} />
                    <span className="text-[9px] text-tertiary font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} className="text-accent" /> Due {task.due}
                    </span>
                    <span className="text-[9px] text-tertiary font-bold uppercase tracking-wider">
                      · {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 md:mt-0 justify-end shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">{task.progress}%</div>
                  <div className="text-[9px] text-tertiary uppercase tracking-wider font-bold">{task.status}</div>
                </div>
                <div className="w-24 h-1.5 bg-base border border-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="p-10 text-center">
              <CheckCircle size={32} className="mx-auto text-emerald-500/20 mb-3" />
              <p className="text-xs text-tertiary font-bold uppercase">No pending assignments</p>
            </div>
          )}
        </div>
      </Card>

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest px-2">History of Excellence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map((task) => (
              <Card key={task.id} className="p-4 border-dashed border-border/60 bg-base/25 hover:border-accent/30 transition-all" onClick={() => onOpenTask(task)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-secondary line-through">{task.title}</span>
                  </div>
                  <Badge text="Completed" type="success" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskModule = ({ tasks, onOpenTask }: { tasks: EmployeeTask[]; onOpenTask: (task: EmployeeTask) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <h2 className="text-xl font-bold text-primary">Strategic Task Board</h2>
          <p className="text-secondary text-xs">Manage assignments, trace timelines, and update performance benchmarks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do / Blocked Column */}
        <div className="space-y-4 bg-base/20 p-4 rounded-2xl border border-border/50">
          <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest px-1 flex items-center justify-between">
            <span>Operational queue</span>
            <span className="bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded text-[8px] border border-orange-500/20">{tasks.filter(t => t.status === 'To Do' || t.status === 'Blocked').length}</span>
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'To Do' || t.status === 'Blocked').map(task => (
              <div key={task.id} onClick={() => onOpenTask(task)} className="p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-accent/40 cursor-pointer transition-all group">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge text={task.status} type={task.status === 'Blocked' ? 'danger' : 'default'} />
                  <span className="text-[8px] font-bold text-tertiary uppercase">#{task.id}</span>
                </div>
                <h4 className="text-xs font-bold text-primary group-hover:text-accent transition-colors mb-2 leading-snug">{task.title}</h4>
                <div className="w-full h-1 bg-base rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-accent" style={{ width: `${task.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-secondary font-bold uppercase">
                  <span>Progress: {task.progress}%</span>
                  <span>{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress / Review Column */}
        <div className="space-y-4 bg-base/20 p-4 rounded-2xl border border-border/50">
          <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest px-1 flex items-center justify-between">
            <span>Active Sprint</span>
            <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[8px] border border-accent/20">{tasks.filter(t => t.status === 'In Progress' || t.status === 'Under Review').length}</span>
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'In Progress' || t.status === 'Under Review').map(task => (
              <div key={task.id} onClick={() => onOpenTask(task)} className="p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-accent/40 cursor-pointer transition-all group">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge text={task.status} type={task.status === 'Under Review' ? 'warning' : 'info'} />
                  <span className="text-[8px] font-bold text-tertiary uppercase">#{task.id}</span>
                </div>
                <h4 className="text-xs font-bold text-primary group-hover:text-accent transition-colors mb-2 leading-snug">{task.title}</h4>
                <div className="w-full h-1 bg-base rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-accent" style={{ width: `${task.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-secondary font-bold uppercase">
                  <span>Progress: {task.progress}%</span>
                  <span>{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="space-y-4 bg-base/20 p-4 rounded-2xl border border-border/50">
          <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-1 flex items-center justify-between">
            <span>Completed ledger</span>
            <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[8px] border border-emerald-500/20">{tasks.filter(t => t.status === 'Done').length}</span>
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'Done').map(task => (
              <div key={task.id} onClick={() => onOpenTask(task)} className="p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-accent/40 cursor-pointer transition-all group opacity-85">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge text="Done" type="success" />
                  <span className="text-[8px] font-bold text-tertiary uppercase">#{task.id}</span>
                </div>
                <h4 className="text-xs font-bold text-secondary line-through mb-2 leading-snug">{task.title}</h4>
                <div className="w-full h-1 bg-base rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-secondary font-bold uppercase">
                  <span>Completed</span>
                  <span>{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeModule = () => {
  const [timer, setTimer] = useState(15620); // 4h 20m 20s
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useUI();

  const [sessionHistory, setSessionHistory] = useState([
    { date: 'May 11', duration: '8h 12m', project: 'Media Campaign', yield: '98%' },
    { date: 'May 10', duration: '7h 45m', project: 'Internal Ops', yield: '94%' },
    { date: 'May 09', duration: '6h 20m', project: 'Global Logistics', yield: '96%' },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCompleteSession = () => {
    if (timer <= 0) {
      showToast('Please start the session timer first!', 'warning');
      return;
    }
    setIsRunning(false);
    
    const h = Math.floor(timer / 3600);
    const m = Math.floor((timer % 3600) / 60);
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    
    const newSession = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: durationStr,
      project: 'Active Session Work',
      yield: `${Math.floor(92 + Math.random() * 7)}%`
    };

    setSessionHistory(prev => [newSession, ...prev]);
    setTimer(0);
    showToast('Shift session successfully logged to history!', 'success');
  };

  const handleExportLogs = () => {
    const headers = 'Date,Duration,Project,Yield\n';
    const rows = sessionHistory.map(h => `${h.date},${h.duration},${h.project},${h.yield}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `time_logs_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    showToast('Time logs exported as CSV successfully!', 'success');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <Card className="flex flex-col items-center justify-center py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
          <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-6 relative z-10">Active Session</h3>
          <div className="text-6xl font-black text-primary tabular-nums mb-8 tracking-tighter relative z-10">
            {formatTime(timer)}
          </div>
          <div className="flex gap-4 relative z-10">
             <button onClick={() => setIsRunning(!isRunning)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${isRunning ? 'bg-orange-500 shadow-orange-500/20' : 'bg-accent shadow-accent/20'}`}>
                {isRunning ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white fill-white ml-1" />}
             </button>
             <button onClick={() => setTimer(0)} className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-base transition-all active:scale-95">
                <RotateCcw size={24} className="text-secondary" />
             </button>
          </div>
          <button 
             onClick={handleCompleteSession}
             className="w-48 mt-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/10 z-10"
          >
             Log Current Shift
          </button>
          <p className="mt-8 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Shift Protocol: Active</p>
       </Card>
       <Card>
          <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-6">Session History</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
             {sessionHistory.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-base border border-border/50 group hover:border-accent/30 transition-all">
                   <div>
                      <div className="text-xs font-bold text-primary">{log.date}</div>
                      <div className="text-[10px] text-tertiary font-bold uppercase">{log.project}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-sm font-black text-accent">{log.duration}</div>
                      <div className="text-[9px] text-emerald-500 font-bold">{log.yield} Yield</div>
                   </div>
                </div>
             ))}
          </div>
          <button onClick={handleExportLogs} className="w-full mt-6 py-2.5 border border-border rounded-xl text-[10px] font-bold uppercase hover:bg-base transition-colors">Export Time Logs</button>
       </Card>
    </div>
  );
};

const ChatModule = () => {
  const [messages, setMessages] = useState([
    { user: 'Maya Thompson', msg: 'Has everyone reviewed the new audit criteria?', time: '09:12 AM', self: false },
    { user: 'You', msg: 'Yes, just finished the Nova Retail section.', time: '09:15 AM', self: true },
    { user: 'Mateo Rivera', msg: 'Working on the logistics bypass now. Should be done in 10.', time: '09:18 AM', self: false },
    { user: 'Sarah Chen', msg: 'I\'ll handle the repository sync after Mateo is done.', time: '09:25 AM', self: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([...messages, { user: 'You', msg: input.trim(), time, self: true }]);
    setInput('');
  };

  return (
    <Card className="p-0 overflow-hidden h-[600px] flex flex-col">
       <div className="p-4 border-b border-border bg-base/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs shadow-sm">TH</div>
             <div>
                <div className="text-xs font-bold text-primary">Team Hub</div>
                <div className="text-[9px] text-emerald-500 font-bold uppercase">12 Online</div>
             </div>
          </div>
          <button className="p-2 hover:bg-base rounded-lg transition-colors"><MoreHorizontal size={16} className="text-secondary"/></button>
       </div>
       <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-base/5">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.self ? 'items-end' : 'items-start'}`}>
               <div className="flex items-center gap-2 mb-1">
                  {!m.self && <span className="text-[10px] font-bold text-secondary">{m.user}</span>}
                  <span className="text-[8px] text-tertiary font-bold">{m.time}</span>
               </div>
               <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium max-w-[70%] shadow-sm ${m.self ? 'bg-accent text-white rounded-tr-none' : 'bg-surface border border-border text-primary rounded-tl-none'}`}>
                  {m.msg}
               </div>
            </div>
          ))}
       </div>
       <div className="p-4 border-t border-border bg-base/30 flex gap-3">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-accent outline-none text-primary font-medium" 
          />
          <button onClick={handleSend} className="p-2.5 bg-accent text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-accent/20">
             <Send size={18} />
          </button>
       </div>
    </Card>
  );
};

const SettingsModule = () => {
  const { toggleTheme } = useTheme();
  const { showToast } = useUI();
  return (
    <Card className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-1">My Settings</h2>
        <p className="text-xs text-secondary font-medium">Manage your personal workspace preferences.</p>
      </div>
      <div className="space-y-6">
         <div className="flex items-center justify-between p-4 bg-base border border-border rounded-2xl">
            <div>
               <div className="text-sm font-bold text-primary">Workspace Theme</div>
               <div className="text-[10px] font-medium text-secondary">Switch between light and dark operational views.</div>
            </div>
            <button onClick={toggleTheme} className="px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold shadow-sm hover:bg-base transition-colors">Toggle Theme</button>
         </div>
         <div className="flex items-center justify-between p-4 bg-base border border-border rounded-2xl">
            <div>
               <div className="text-sm font-bold text-primary">Notification Preferences</div>
               <div className="text-[10px] font-medium text-secondary">Manage what alerts you receive in your hub.</div>
            </div>
            <button onClick={() => showToast('Routing settings loaded successfully in main control settings panel!', 'success')} className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-sm shadow-accent/20 hover:bg-indigo-600 transition-colors">Configure</button>
         </div>
      </div>
    </Card>
  );
};

// --- Main Shell ---

function EmployeeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'workspace' | 'settings' | 'tasks' | 'time' | 'chat'>('workspace');
  const { showToast } = useUI();

  useEffect(() => {
    if (tab && ['workspace', 'settings', 'tasks', 'time', 'chat'].includes(tab)) {
      setActiveTab(tab as any);
    } else {
      setActiveTab('workspace');
    }
  }, [tab]);

  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // High fidelity structures for assignments
  const [tasks, setTasks] = useState<EmployeeTask[]>([
    { 
      id: 1, 
      title: 'Update media assets for Nova Retail', 
      desc: 'Compress and upload all high-resolution promotional materials, print sequences, and brand videos for the Nova Retail Summer campaign.',
      due: 'Today', 
      priority: 'High', 
      status: 'In Progress', 
      progress: 65,
      estimatedHours: 8,
      completed: false,
      attachments: ['Nova_Brandbook_v2.pdf', 'Nova_Summer_Assets_Raw.zip'],
      subtasks: [
        { title: 'Compress high-res promotional sequence assets', done: true },
        { title: 'Validate asset scaling ratios', done: true },
        { title: 'Upload bundle sequences to CDN bucket', done: false }
      ],
      logs: [
        { time: '09:12 AM', author: 'Priya Patel', note: 'Configured cloud bucket CDN parameters with cache headers.' },
        { time: '11:30 AM', author: 'Priya Patel', note: 'Compressed raw summer visuals by 45%.' }
      ]
    },
    { 
      id: 2, 
      title: 'Draft weekly performance overview', 
      desc: 'Generate weekly analytical report outlining logistics bottlenecks, R2 migration node status, and yield ratios across active nodes.',
      due: 'Tomorrow', 
      priority: 'Normal', 
      status: 'To Do', 
      progress: 0,
      estimatedHours: 4,
      completed: false,
      attachments: ['Logistics_Telemetry_Sheet.xlsx'],
      subtasks: [
        { title: 'Gather bandwidth consumption telemetry', done: false },
        { title: 'Calculate personnel output parameters', done: false }
      ],
      logs: []
    },
    { 
      id: 3, 
      title: 'Validate cloud storage bandwidth', 
      desc: 'Verify load speeds, transfer yield, and potential egress congestion during peak hours for server cluster APAC-West.',
      due: 'May 14', 
      priority: 'Critical', 
      status: 'Under Review', 
      progress: 95,
      estimatedHours: 12,
      completed: false,
      attachments: ['APAC_West_Telemetry.log', 'Egress_Audit_Template.pdf'],
      subtasks: [
        { title: 'Initiate load simulation nodes', done: true },
        { title: 'Identify cache bypass bottlenecks', done: true },
        { title: 'Compile visual telemetry report', done: true }
      ],
      logs: [
        { time: 'Yesterday', author: 'Priya Patel', note: 'Initiated active load simulation tests with 10k concurrent virtual users.' },
        { time: 'Today 08:00 AM', author: 'Priya Patel', note: 'Telemetry logged. Node APAC-West is holding stable at 99.4% egress yield.' }
      ]
    },
  ]);

  // Selected Task for Details Modal
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  
  // Interactive Update State for Modal
  const [editStatus, setEditStatus] = useState<EmployeeTask['status']>('To Do');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [newLogNote, setNewLogNote] = useState<string>('');

  const handleOpenTask = (task: EmployeeTask) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setEditProgress(task.progress);
    setNewLogNote('');
  };

  const handleToggleSubtask = (index: number) => {
    if (!selectedTask) return;
    const updatedSub = [...selectedTask.subtasks];
    updatedSub[index].done = !updatedSub[index].done;
    
    // Auto calculate progress percentage based on subtasks
    const doneCount = updatedSub.filter(s => s.done).length;
    const computedProgress = Math.round((doneCount / updatedSub.length) * 100);

    setSelectedTask({
      ...selectedTask,
      subtasks: updatedSub,
      progress: computedProgress
    });
    setEditProgress(computedProgress);
  };

  const handleSaveProgress = () => {
    if (!selectedTask) return;

    let updatedLogs = [...selectedTask.logs];
    if (newLogNote.trim()) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      updatedLogs.push({
        time: timeStr,
        author: 'Priya Patel',
        note: newLogNote.trim()
      });
    }

    const isDone = editStatus === 'Done' || editProgress === 100;
    const finalProgress = isDone ? 100 : editProgress;
    const finalStatus = isDone ? 'Done' : editStatus;

    const updatedTask: EmployeeTask = {
      ...selectedTask,
      status: finalStatus as any,
      progress: finalProgress,
      completed: isDone,
      logs: updatedLogs
    };

    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(null);
    showToast(`Task "${selectedTask.title}" successfully updated to ${finalProgress}% [${finalStatus}]`, 'success');
  };

  // Settings tab gets full-page layout bypassing the two-column grid
  if (activeTab === 'settings') {
    return (
      <div className="flex-1 flex h-full overflow-hidden">
        <SharedSettingsModule role="staff" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Badge text="Operations Staff" type="info" />
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">Shift Status: Active</span>
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Staff Workspace</h1>
          <p className="text-secondary text-sm mt-1 font-medium">Focus on your active assignments and collaborative tasks.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-surface border border-border p-3 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="text-right border-r border-border pr-4">
                 <div className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">Efficiency Index</div>
                 <div className="text-lg font-bold text-primary mt-1 leading-none">98.4%</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                 <BarChart3 size={20} />
              </div>
           </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         {[
           { label: 'My Active Tasks', value: tasks.filter(t => t.status !== 'Done').length.toString(), icon: CheckSquare, color: 'text-accent', bg: 'bg-accent/10', tab: 'tasks' },
           { label: 'Logged Hours', value: '34.5', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10', tab: 'time' },
           { label: 'Weekly Trend', value: '+14%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10', tab: 'workspace' },
           { label: 'Messages', value: '3', icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-500/10', tab: 'chat' },
         ].map((stat, i) => (
           <Card key={i} delay={i * 0.05} className="p-4 border-border/60 cursor-pointer hover:border-accent/30 group" onClick={() => router.push(`/employee?tab=${stat.tab}`)}>
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon size={20} />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-tertiary uppercase mb-0.5 leading-none">{stat.label}</div>
                    <div className="text-lg font-bold text-primary mt-1 leading-none">{stat.value}</div>
                 </div>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Dynamic Content */}
        <div className="xl:col-span-2 space-y-8">
           <AnimatePresence mode="wait">
              {activeTab === 'workspace' && (
                <motion.div key="workspace" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}}>
                   <WorkspaceModule tasks={tasks} onFullSchedule={() => router.push('/employee?tab=tasks')} onOpenTask={handleOpenTask} />
                </motion.div>
              )}
              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}}>
                   <TaskModule tasks={tasks} onOpenTask={handleOpenTask} />
                </motion.div>
              )}
              {activeTab === 'time' && (
                <motion.div key="time" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}}>
                   <TimeModule />
                </motion.div>
              )}
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: 10}}>
                   <ChatModule />
                </motion.div>
              )}

           </AnimatePresence>
        </div>

        {/* Persistence Sidebar */}
        <div className="space-y-8">
            <Card className="relative group overflow-hidden border-border/80 bg-surface">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors"></div>
               <h3 className="text-xs font-bold mb-4 flex items-center gap-2 relative z-10 text-orange-500 uppercase tracking-wider"><Star size={14} className="fill-orange-400 text-orange-400"/> Top Performer</h3>
               <p className="text-xs text-secondary leading-relaxed mb-6 relative z-10 font-medium font-sans">Congratulations Priya! You&apos;ve maintained a 98% efficiency rate this week. Keep up the great work!</p>
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center font-black text-2xl border border-accent/20">🏆</div>
                  <div>
                     <div className="text-[9px] font-bold uppercase tracking-widest text-tertiary leading-none mb-1">Current Streak</div>
                     <div className="text-lg font-extrabold leading-none text-indigo-600 dark:text-indigo-400">14 Days</div>
                  </div>
               </div>
            </Card>

            <Card>
               <h3 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-6">Active Team</h3>
               <div className="space-y-4">
                  {[
                    { name: 'Mateo Rivera', status: 'Online', color: 'bg-accent' },
                    { name: 'Sarah Chen', status: 'Away', color: 'bg-emerald-500' },
                    { name: 'Alex Johnson', status: 'Online', color: 'bg-orange-500' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-base rounded-xl transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${user.color} text-white flex items-center justify-center font-bold text-[10px] shadow-sm group-hover:scale-110 transition-transform`}>{user.name.split(' ').map(n=>n[0]).join('')}</div>
                          <span className="text-xs font-bold text-primary">{user.name}</span>
                       </div>
                       <div className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                    </div>
                  ))}
               </div>
               <button onClick={() => router.push('/employee?tab=chat')} className="w-full mt-6 py-2 bg-base border border-border rounded-xl text-[10px] font-bold uppercase hover:bg-surface transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={12}/> Open Team Hub
               </button>
            </Card>

            <Card className="bg-accent/5 border-accent/20 relative group">
               <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
               </div>
               <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4">Daily Briefing</h3>
               <p className="text-[11px] text-secondary leading-relaxed font-medium">System audit scheduled for 3 PM today. Please ensure all media assets are validated by then.</p>
               <button 
                  onClick={() => { setIsAcknowledged(true); showToast('Protocol acknowledged', 'success'); }} 
                  disabled={isAcknowledged}
                  className={`mt-4 w-full py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isAcknowledged ? 'bg-emerald-500/20 text-emerald-500 shadow-none' : 'bg-accent text-white hover:bg-indigo-600 shadow-accent/10'}`}
               >
                  {isAcknowledged ? <><CheckCircle size={14}/> Acknowledged</> : 'Acknowledge Protocol'}
               </button>
            </Card>
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">#{selectedTask.id}</span>
                    <Badge text={selectedTask.priority} type={selectedTask.priority === 'Critical' ? 'danger' : selectedTask.priority === 'High' ? 'warning' : 'info'} />
                  </div>
                  <h3 className="text-lg font-bold text-primary">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-base rounded-lg text-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar text-xs">
                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold text-tertiary uppercase mb-1.5 tracking-wider">Description</h4>
                  <p className="text-secondary leading-relaxed font-sans font-medium p-4 bg-base rounded-2xl border border-border/50">{selectedTask.desc}</p>
                </div>

                {/* Subtasks Checklist */}
                <div>
                  <h4 className="text-[10px] font-bold text-tertiary uppercase mb-2 tracking-wider flex items-center gap-1.5">
                    <ListChecks size={12} className="text-accent" /> Subtask Protocols ({selectedTask.subtasks.filter(s=>s.done).length}/{selectedTask.subtasks.length})
                  </h4>
                  <div className="space-y-2 bg-base p-4 rounded-2xl border border-border/50">
                    {selectedTask.subtasks.map((sub, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleToggleSubtask(idx)}
                        className="flex items-center gap-3 p-2 rounded-xl bg-surface border border-border/30 hover:border-accent/30 cursor-pointer transition-all"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${sub.done ? 'bg-accent border-accent text-white' : 'border-border bg-base'}`}>
                          {sub.done && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className={`text-[11px] font-semibold ${sub.done ? 'text-secondary line-through' : 'text-primary'}`}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments & Target SLA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-tertiary uppercase mb-2 tracking-wider flex items-center gap-1.5">
                      <Paperclip size={12} className="text-accent" /> Attachments
                    </h4>
                    <div className="space-y-1.5">
                      {selectedTask.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-base border border-border rounded-xl text-[10px] font-bold text-secondary hover:text-accent hover:border-accent/30 transition-colors">
                          <span className="truncate">{file}</span>
                          <span className="text-[8px] bg-base border border-border/80 px-2 py-0.5 rounded text-tertiary uppercase shrink-0">ZIP/PDF</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-base rounded-2xl border border-border/50 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-tertiary uppercase tracking-wider mb-2">Estimated Allocation Time</div>
                      <div className="text-2xl font-black text-primary leading-none tracking-tight">{selectedTask.estimatedHours} Hours</div>
                    </div>
                    <div className="pt-4 border-t border-border/50 mt-4 flex justify-between items-center text-[10px] text-secondary font-bold uppercase">
                      <span>Target SLA</span>
                      <span className="text-emerald-500 font-extrabold">Within 24 Hours</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Status & Percentage Updates */}
                <div className="p-5 bg-surface border border-accent/20 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">⚡ Update Operational Progress</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-tertiary uppercase mb-1.5">Status Clear</label>
                      <select 
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        className="w-full bg-base border border-border rounded-xl px-3 py-2.5 text-xs text-primary focus:ring-1 focus:ring-accent outline-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-tertiary uppercase mb-1.5 flex justify-between">
                        <span>Progress Ratio</span>
                        <span className="text-accent">{editProgress}%</span>
                      </label>
                      <div className="flex items-center gap-3 pt-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={editProgress}
                          onChange={e => setEditProgress(parseInt(e.target.value))}
                          className="flex-1 accent-indigo-600 dark:accent-indigo-400 bg-base rounded-lg h-1.5 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Log / Daily Progress Notes */}
                  <div>
                    <label className="block text-[10px] font-bold text-tertiary uppercase mb-1.5">Add Work Log Note</label>
                    <textarea 
                      value={newLogNote}
                      onChange={e => setNewLogNote(e.target.value)}
                      placeholder="Specify log updates (e.g., Compressed files, synced APAC simulation node, verified SLA target)..."
                      className="w-full bg-base border border-border rounded-xl px-4 py-3 text-xs text-primary focus:ring-1 focus:ring-accent outline-none h-20 resize-none font-medium"
                    />
                  </div>
                </div>

                {/* Progress Notes Timeline / Work Logs */}
                <div>
                  <h4 className="text-[10px] font-bold text-tertiary uppercase mb-3 tracking-wider">Telemetry & Work Log History</h4>
                  {selectedTask.logs.length > 0 ? (
                    <div className="space-y-3 pl-2 border-l-2 border-border/80">
                      {selectedTask.logs.map((log, lIdx) => (
                        <div key={lIdx} className="relative pl-4">
                          <div className="absolute left-[-13px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface"></div>
                          <div className="text-[10px] text-secondary font-bold flex justify-between mb-0.5">
                            <span>{log.author}</span>
                            <span className="text-tertiary font-mono font-normal text-[8px]">{log.time}</span>
                          </div>
                          <p className="text-xs text-primary font-medium">{log.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-base rounded-2xl text-center border border-border border-dashed">
                      <p className="text-[9px] text-tertiary uppercase font-bold">No progress logs recorded for this initiative.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-border pt-4 mt-4 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 bg-base border border-border rounded-xl text-xs font-bold text-secondary hover:bg-border/20 transition-all active:scale-95"
                >
                  Discard Changes
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveProgress}
                  className="px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Progress Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EmployeePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
         <div className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Workspace...</div>
      </div>
    }>
       <EmployeeDashboard />
    </Suspense>
  );
}
