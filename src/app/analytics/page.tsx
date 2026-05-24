'use client';
import { useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Download, TrendingUp, CheckCircle, Target, BarChart3, Users, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Analytics() {
  const { showToast } = useUI();
  const [isExporting, setIsExporting] = useState(false);
  const [activePeriod, setActivePeriod] = useState('month');

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast('Analytics report exported as CSV', 'success');
    }, 1500);
  };

  // Period-specific data for KPIs
  const kpiData = {
    week: [
      { title: 'Task Completion Rate', value: '84%', change: '+12%', icon: CheckCircle, color: 'text-emerald-500', bar: 84 },
      { title: 'Lead Conversion Rate', value: '14%', change: '+2%', icon: Target, color: 'text-blue-500', bar: 14 },
      { title: 'Payment Collection', value: '92%', change: '+5%', icon: TrendingUp, color: 'text-orange-500', bar: 92 },
      { title: 'Team Utilization', value: '75%', change: '+8%', icon: Users, color: 'text-purple-500', bar: 75 },
    ],
    month: [
      { title: 'Task Completion Rate', value: '72%', change: '+8%', icon: CheckCircle, color: 'text-emerald-500', bar: 72 },
      { title: 'Lead Conversion Rate', value: '17%', change: '+3%', icon: Target, color: 'text-blue-500', bar: 17 },
      { title: 'Payment Collection', value: '85%', change: '+2%', icon: TrendingUp, color: 'text-orange-500', bar: 85 },
      { title: 'Team Utilization', value: '68%', change: '-4%', icon: Users, color: 'text-purple-500', bar: 68 },
    ],
    quarter: [
      { title: 'Task Completion Rate', value: '65%', change: '-2%', icon: CheckCircle, color: 'text-emerald-500', bar: 65 },
      { title: 'Lead Conversion Rate', value: '22%', change: '+7%', icon: Target, color: 'text-blue-500', bar: 22 },
      { title: 'Payment Collection', value: '78%', change: '-3%', icon: TrendingUp, color: 'text-orange-500', bar: 78 },
      { title: 'Team Utilization', value: '62%', change: '-6%', icon: Users, color: 'text-purple-500', bar: 62 },
    ]
  }[activePeriod as 'week' | 'month' | 'quarter'];

  const taskData = [
    { label: 'To Do', count: 18, color: 'bg-gray-400 dark:bg-gray-500', pct: 25 },
    { label: 'In Progress', count: 12, color: 'bg-blue-500', pct: 17 },
    { label: 'In Review', count: 7, color: 'bg-yellow-500', pct: 10 },
    { label: 'Completed', count: 24, color: 'bg-emerald-500', pct: 33 },
    { label: 'Blocked', count: 3, color: 'bg-red-500', pct: 4 },
    { label: 'Overdue', count: 8, color: 'bg-orange-500', pct: 11 },
  ];

  const leadData = [
    { label: 'New', count: 8, color: 'bg-gray-400', pct: 10 },
    { label: 'Contacted', count: 24, color: 'bg-blue-500', pct: 30 },
    { label: 'Interested', count: 19, color: 'bg-yellow-500', pct: 24 },
    { label: 'Proposal Sent', count: 12, color: 'bg-purple-500', pct: 15 },
    { label: 'Won', count: 14, color: 'bg-emerald-500', pct: 17 },
    { label: 'Lost', count: 3, color: 'bg-red-500', pct: 4 },
  ];

  const employees = [
    { name: 'Maya Thompson', tasks: 14, completed: 9, pct: 64, role: 'Ops Director' },
    { name: 'Mateo Rivera', tasks: 11, completed: 8, pct: 73, role: 'Developer' },
    { name: 'Priya Patel', tasks: 9, completed: 5, pct: 56, role: 'Marketing' },
    { name: 'Lena Kawasaki', tasks: 7, completed: 6, pct: 86, role: 'Finance' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-base text-primary transition-colors min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary">Analytics & Reports</h1>
          <p className="text-secondary text-sm font-medium">Monitor team performance, lead conversion, and revenue metrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface border border-border rounded-xl p-1 shadow-inner">
              {['week', 'month', 'quarter'].map(p => (
                  <button
                    key={p}
                    onClick={() => { setActivePeriod(p); showToast(`Viewing: ${p}`, 'info'); }}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${activePeriod === p ? 'bg-base text-accent shadow-sm border border-border/50' : 'text-secondary hover:text-primary hover:bg-base/30'}`}
                  >
                    {p}
                  </button>
              ))}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(99,102,241,0.2)] hover:bg-indigo-600 transition-all disabled:opacity-70"
          >
            {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Download size={18} />}
            Export Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AnimatePresence mode="wait">
          {kpiData.map((kpi, i) => (
            <motion.div 
              key={`${activePeriod}-${i}`} 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}} 
              exit={{opacity:0, y:-10}}
              transition={{duration: 0.2, delay: i * 0.05}} 
              className="p-6 rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/40 transition-all"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest">{kpi.title}</h3>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color} bg-current/10`}>
                  <kpi.icon size={14} className={kpi.color} />
                </div>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-bold tracking-tight text-primary">{kpi.value}</span>
                <span className={`text-[11px] font-bold mb-1 ${kpi.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{kpi.change}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{width: 0}}
                  animate={{width: `${kpi.bar}%`}}
                  transition={{delay: 0.2, duration: 0.8, ease: 'easeOut'}}
                  className={`h-full rounded-full ${kpi.color.replace('text-', 'bg-')}`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Task Breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <CheckCircle size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-primary">Task Breakdown</h2>
          </div>
          <div className="flex flex-col gap-4">
            {taskData.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{item.count}</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{width: 0}}
                    animate={{width: `${item.pct}%`}}
                    transition={{delay: i * 0.05 + 0.1, duration: 0.6, ease: 'easeOut'}}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Pipeline Funnel */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Target size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-primary">Lead Pipeline</h2>
          </div>
          <div className="flex flex-col gap-4">
            {leadData.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{item.count}</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{width: 0}}
                    animate={{width: `${item.pct}%`}}
                    transition={{delay: i * 0.05 + 0.1, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <BarChart3 size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-primary">Invoice Summary</h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Total Invoiced', value: '$182,400', color: 'text-primary' },
              { label: 'Collected', value: '$154,850', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending', value: '$18,200', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Overdue', value: '$9,350', color: 'text-red-600 dark:text-red-400' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-xs font-semibold text-secondary">{row.label}</span>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-base/30">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            <h2 className="text-base font-bold text-primary">Employee Performance</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => showToast('Applying filters...', 'info')} className="flex items-center gap-2 px-4 py-1.5 border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-base transition-colors">
              <Filter size={14} /> Filter
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-1.5 border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-base transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] font-bold text-secondary uppercase tracking-widest border-b border-border bg-base">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Total Tasks</th>
              <th className="px-6 py-4">Completed</th>
              <th className="px-6 py-4">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp, i) => (
              <tr key={i} className="hover:bg-base/50 transition-colors group cursor-pointer" onClick={() => showToast(`Viewing details for ${emp.name}`, 'info')}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-xs text-primary group-hover:text-accent transition-colors">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-secondary font-medium">{emp.role}</td>
                <td className="px-6 py-4 text-xs font-bold text-primary">{emp.tasks}</td>
                <td className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">{emp.completed}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{width:0}}
                        animate={{width: `${emp.pct}%`}}
                        transition={{delay: i * 0.1 + 0.3, duration: 0.6}}
                        className={`h-full rounded-full ${emp.pct >= 80 ? 'bg-emerald-500' : emp.pct >= 60 ? 'bg-blue-500' : 'bg-orange-500'}`}
                      />
                    </div>
                    <span className={`text-[11px] font-bold ${emp.pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : emp.pct >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{emp.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
