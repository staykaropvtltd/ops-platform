'use client';
import { useState } from 'react';
import { useUI } from '@/context/UIContext';
import { downloadCSV } from '@/utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, TrendingUp, CheckCircle, Plus, Calendar, Users, ExternalLink, MoreHorizontal, FileText, AlertCircle, Clock, X } from 'lucide-react';

export default function Dashboard() {
  const { showToast } = useUI();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: number; title: string; priority: string; due: string; owner: string; color: string; completed: boolean; desc: string; } | null>(null);

  const statsData = {
    today: [
      { title: 'Total MRR', value: '$182,400', change: '+6.2%', sub: 'vs yesterday', color: 'text-emerald-600 dark:text-emerald-400' },
      { title: 'Monthly Churn', value: '1.8%', change: '-0.4%', sub: 'Real-time', color: 'text-blue-600 dark:text-blue-400' },
      { title: 'Open Tasks', value: '48', change: '+12', sub: 'Assigned today', color: 'text-orange-600 dark:text-orange-400' },
      { title: 'New Leads', value: '12', change: 'Hot', sub: 'Today', color: 'text-emerald-600 dark:text-emerald-400' },
    ],
    week: [
      { title: 'Total MRR', value: '$1,240,000', change: '+12.4%', sub: 'vs last week', color: 'text-emerald-600 dark:text-emerald-400' },
      { title: 'Monthly Churn', value: '2.1%', change: '+0.1%', sub: 'Weekly avg', color: 'text-blue-600 dark:text-blue-400' },
      { title: 'Open Tasks', value: '156', change: '+44', sub: 'Total this week', color: 'text-orange-600 dark:text-orange-400' },
      { title: 'New Leads', value: '84', change: 'Steady', sub: 'This week', color: 'text-emerald-600 dark:text-emerald-400' },
    ],
    custom: [
      { title: 'Total MRR', value: '$4,120,000', change: '+18.7%', sub: 'Selected range', color: 'text-emerald-600 dark:text-emerald-400' },
      { title: 'Monthly Churn', value: '1.9%', change: '-0.2%', sub: 'Period avg', color: 'text-blue-600 dark:text-blue-400' },
      { title: 'Open Tasks', value: '312', change: '+88', sub: 'Historical data', color: 'text-orange-600 dark:text-orange-400' },
      { title: 'New Leads', value: '245', change: 'High', sub: 'Total in range', color: 'text-emerald-600 dark:text-emerald-400' },
    ]
  };

  const stats = statsData[activeTab as 'today' | 'week' | 'custom'];

  const [tasks, setTasks] = useState([
     { id: 1, title: 'Design onboarding email sequence', priority: 'High', due: 'May 10', owner: 'Mateo', color: 'orange', completed: false, desc: 'Draft the initial 3 emails for the welcome sequence using the new brand guidelines.' },
     { id: 2, title: 'Follow-up with Acme Corp lead', priority: 'Medium', due: 'May 11', owner: 'Priya', color: 'blue', completed: false, desc: 'Check in regarding the proposal sent last Tuesday.' },
     { id: 3, title: 'Prepare invoice #INV-882', priority: 'Low', due: 'May 15', owner: 'Lena', color: 'gray', completed: false, desc: 'Compile billable hours for April.' },
  ]);

  const employees = [
    { name: 'Maya Thompson', role: 'Ops Director', status: 'Online', tasks: 14 },
    { name: 'Mateo Rivera', role: 'Developer', status: 'Busy', tasks: 11 },
    { name: 'Priya Patel', role: 'Marketing', status: 'Online', tasks: 9 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => { 
      downloadCSV(tasks, `Operations_Report_${activeTab}`);
      setIsExporting(false); 
      showToast('Operations report exported as CSV!', 'success'); 
    }, 1500);
  };

  const toggleTask = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setTasks(tasks.map(t => {
      if (t.id === id) { showToast(!t.completed ? 'Task completed!' : 'Task re-opened', 'success'); return { ...t, completed: !t.completed }; }
      return t;
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-base text-primary transition-colors min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Operations Workspace</h1>
          <p className="text-secondary text-sm font-medium">Monitor MRR, handle active tasks, and track outstanding invoices.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface border border-border rounded-xl p-1 shadow-inner">
            {['today', 'week', 'custom'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); showToast(`Viewing: ${tab}`, 'info'); }}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-base text-accent shadow-sm ring-1 ring-border/50' : 'text-secondary hover:text-primary hover:bg-base/30'}`}>
                {tab}
              </button>
            ))}
          </div>
          <button onClick={handleExport} disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(16,185,129,0.2)] hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-70">
            {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Download size={18} />}
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AnimatePresence mode="wait">
          {stats.map((stat, i) => (
            <motion.div 
              key={`${activeTab}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/40 transition-all"
            >
              <h3 className="text-xs font-semibold text-secondary mb-4 tracking-wider uppercase">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight mb-1 text-primary">{stat.value}</div>
                  <div className="text-[11px] font-medium text-tertiary">{stat.sub}</div>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border border-current ${stat.color} bg-current/10`}>
                  <TrendingUp size={10} /> {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Active Tasks */}
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border bg-base/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-accent" size={20} />
                <h2 className="text-lg font-bold">Active Tasks</h2>
              </div>
              <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-base border border-border rounded-lg hover:border-accent/50 hover:text-accent transition-colors shadow-sm">
                <Plus size={14} /> Create Task
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {tasks.map(task => (
                <div key={task.id} onClick={() => setSelectedTask(task)}
                  className={`flex justify-between items-start p-5 border rounded-xl transition-all group cursor-pointer shadow-sm ${task.completed ? 'border-border bg-base opacity-60' : 'border-border hover:border-accent/50 bg-base'}`}>
                  <div className="flex items-start gap-4 flex-1">
                    <button onClick={(e) => toggleTask(e, task.id)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-accent border-accent text-white' : 'border-gray-300 dark:border-gray-600 hover:border-accent'}`}>
                      {task.completed && <CheckCircle size={12} />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold mb-1.5 transition-colors ${task.completed ? 'line-through text-secondary' : 'text-primary group-hover:text-accent'}`}>{task.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-secondary">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-current text-${task.color}-600 dark:text-${task.color}-400 bg-current/10`}>{task.priority}</span>
                        <span className="flex items-center gap-1"><Calendar size={10}/> Due {task.due}</span>
                        <span><Users size={10} className="inline mr-1"/>{task.owner}</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-tertiary opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Team Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{opacity:0,y:20}} 
              animate={{opacity:1,y:0}} 
              transition={{delay:0.1, duration: 0.5, ease: "circOut"}} 
              className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-500" size={18} />
                  <h2 className="text-base font-bold">Team Overview</h2>
                </div>
                <button onClick={() => showToast('Viewing team performance', 'info')} className="text-xs font-semibold text-accent hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {employees.map((emp, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center justify-between p-3 rounded-lg bg-base border border-border/50 hover:border-accent/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{emp.name}</div>
                        <div className="text-[10px] text-secondary font-medium">{emp.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold">{emp.tasks} Tasks</div>
                        <div className="text-[10px] text-emerald-500 font-bold">{emp.status}</div>
                      </div>
                      <MoreHorizontal size={14} className="text-tertiary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Invoices & Overdue */}
            <div className="flex flex-col gap-6">
              <motion.div 
                initial={{opacity:0,y:20}} 
                animate={{opacity:1,y:0}} 
                transition={{delay:0.2, duration: 0.5, ease: "circOut"}} 
                className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow flex-1"
              >
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-orange-500" size={18} />
                    <h2 className="text-base font-bold">Pending Approvals</h2>
                  </div>
                  <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">3 Required</span>
                </div>
                <div className="space-y-3">
                   {[
                     { id: 'INV-882', client: 'Hexacloud', amount: '$4,200', date: '2h ago' },
                     { id: 'INV-885', client: 'Nova Retail', amount: '$1,850', date: '5h ago' }
                   ].map((inv, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, x: 10 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       transition={{ delay: 0.4 + (i * 0.1) }}
                       className="flex items-center justify-between p-3 bg-base border border-border rounded-lg group hover:border-accent/30 transition-all"
                     >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-primary group-hover:text-accent transition-colors truncate">{inv.id} · {inv.client}</div>
                          <div className="text-[10px] text-secondary font-medium">{inv.amount} · Received {inv.date}</div>
                        </div>
                        <button onClick={() => showToast(`Invoice ${inv.id} approved!`, 'success')} className="px-3 py-1 bg-accent text-white text-[9px] font-bold rounded hover:bg-emerald-600 active:scale-95 transition-all shrink-0">Approve</button>
                     </motion.div>
                   ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{opacity:0, scale: 0.95}} 
                animate={{opacity:1, scale: 1}} 
                transition={{delay:0.4}}
                className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm flex items-center justify-between hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                      <AlertCircle size={18} />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Overdue</div>
                      <div className="text-xl font-bold text-primary">$74,250</div>
                   </div>
                </div>
                <button onClick={() => showToast('Opening collections view', 'info')} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500">
                   <ExternalLink size={18} />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-1 flex flex-col gap-8">
          <motion.div 
            initial={{opacity:0,x:20}} 
            animate={{opacity:1,x:0}} 
            transition={{duration: 0.5}}
            className="p-6 rounded-2xl border border-border bg-surface shadow-sm"
          >
            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsTaskModalOpen(true)} className="p-5 rounded-xl bg-base border border-border hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all shadow-sm text-left group">
                <CheckCircle size={18} className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform"/>
                <h4 className="text-xs font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Create Task</h4>
              </button>
              <button onClick={() => setIsLeadModalOpen(true)} className="p-5 rounded-xl bg-base border border-border hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all shadow-sm text-left group">
                <Users size={18} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform"/>
                <h4 className="text-xs font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">Add Lead</h4>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{opacity:0,x:20}} 
            animate={{opacity:1,x:0}} 
            transition={{delay:0.1, duration: 0.5}} 
            className="p-6 rounded-2xl border border-border bg-surface shadow-sm flex-1 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h2 className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2"><Users size={12}/> System Users</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-base border border-border text-tertiary">Read-only</span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Maya Thompson', role: 'Admin', email: 'm.thompson@ops.co' },
                { name: 'Mateo Rivera', role: 'Manager', email: 'm.rivera@ops.co' },
                { name: 'Priya Patel', role: 'Employee', email: 'p.patel@ops.co' },
              ].map((user, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3 p-2 hover:bg-base rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent group-hover:bg-accent group-hover:text-white transition-all">{user.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-primary truncate">{user.name}</div>
                    <div className="text-[10px] text-secondary truncate">{user.email}</div>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-border bg-base uppercase text-secondary shrink-0">{user.role}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{opacity:0,x:20}} 
            animate={{opacity:1,x:0}} 
            transition={{delay:0.2, duration: 0.5}} 
            className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h2 className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Deadlines</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-base border border-border text-tertiary">7d</span>
            </div>
            <div className="space-y-5">
              {[
                { t: 'Contract review for Beacon Health', due: 'May 9', owner: 'Jordan Lee' },
                { t: 'Finalize Q2 pricing architecture', due: 'May 11', owner: 'Nina Gomez' },
              ].map((d, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="group relative pl-4 border-l-2 border-border hover:border-accent transition-colors cursor-pointer"
                >
                  <h4 className="text-xs font-bold mb-1 leading-snug group-hover:text-accent transition-colors">{d.t}</h4>
                  <p className="text-[11px] font-semibold text-secondary">Due {d.due} · {d.owner}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-base/50">
                <h2 className="text-base font-bold">Create New Task</h2>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-1 hover:bg-surface rounded-md text-secondary hover:text-primary transition-colors"><X size={18}/></button>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Task Title</label>
                  <input type="text" placeholder="e.g. Design homepage hero" className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-accent text-primary text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Priority</label>
                    <select className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-accent text-primary appearance-none font-bold text-sm">
                      <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Due Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-accent text-primary font-bold text-sm" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-base/50">
                <button onClick={() => setIsTaskModalOpen(false)} className="px-5 py-2 text-xs font-bold text-secondary hover:text-primary transition-colors">Cancel</button>
                <button onClick={() => { setIsTaskModalOpen(false); showToast('Task created and assigned!', 'success'); }} className="px-8 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg active:scale-95 transition-all text-xs">Save Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isLeadModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-base/50">
                <h2 className="text-base font-bold flex items-center gap-2 text-primary"><Users size={16} className="text-blue-500"/> Add New Lead</h2>
                <button onClick={() => setIsLeadModalOpen(false)} className="p-1 hover:bg-surface rounded-md text-secondary hover:text-primary transition-colors"><X size={18}/></button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" placeholder="e.g. Maya Thompson" className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-blue-500 text-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Company</label>
                  <input type="text" placeholder="Company INC" className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-blue-500 text-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Est. Value ($)</label>
                  <input type="number" placeholder="24000" className="w-full px-4 py-2 border border-border bg-base rounded-lg focus:outline-none focus:border-blue-500 text-primary text-sm font-medium" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-base/50">
                <button onClick={() => setIsLeadModalOpen(false)} className="px-5 py-2 text-xs font-bold text-secondary hover:text-primary transition-colors">Cancel</button>
                <button onClick={() => { setIsLeadModalOpen(false); showToast('Lead saved to pipeline!', 'success'); }} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all text-xs">Import Lead</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedTask && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-base/50">
                <span className="text-[9px] font-mono bg-border px-2 py-1 rounded text-secondary uppercase tracking-wider">OPS-TASK-{selectedTask.id}</span>
                <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-surface rounded-md text-secondary hover:text-primary transition-colors"><X size={18}/></button>
              </div>
              <div className="p-8 pb-4">
                <h2 className="text-xl font-bold mb-4">{selectedTask.title}</h2>
                <p className="text-xs text-secondary leading-relaxed mb-8">{selectedTask.desc}</p>
                <div className="grid grid-cols-2 gap-y-6 text-xs border-t border-border pt-6">
                  <div><h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Priority</h4>
                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border border-current text-${selectedTask.color}-600 dark:text-${selectedTask.color}-400 bg-current/10`}>{selectedTask.priority}</span></div>
                  <div><h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Owner</h4>
                    <div className="font-bold flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-[9px] text-accent">{selectedTask.owner[0]}</div>{selectedTask.owner}</div></div>
                  <div><h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Due Date</h4>
                    <div className="font-bold flex items-center gap-2"><Calendar size={12} className="text-secondary"/> {selectedTask.due}</div></div>
                  <div><h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Status</h4>
                    <div className={`font-bold flex items-center gap-2 ${selectedTask.completed ? 'text-accent' : ''}`}>{selectedTask.completed ? <CheckCircle size={12}/> : <Clock size={12}/>}{selectedTask.completed ? 'Completed' : 'Pending'}</div></div>
                </div>
              </div>
              <div className="px-8 py-5 border-t border-border flex justify-end bg-base/30 mt-4">
                <button onClick={() => setSelectedTask(null)} className="px-8 py-2.5 bg-surface border border-border text-primary font-bold rounded-xl hover:bg-base hover:border-accent transition-all active:scale-95 text-xs">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
