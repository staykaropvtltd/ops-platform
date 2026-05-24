'use client';
import { useState, useEffect, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { 
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, Calendar, ChevronRight, LayoutGrid, List, Download, Target, TrendingUp, Clock, CheckCircle, X, Send, FileText, Settings, Zap, Upload, User, AlertCircle, MessageSquare, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadCSV } from '@/utils/export';
import { triggerActivityLog } from '@/utils/activity';

type Lead = {
  _id?: string;
  name: string;
  company: string;
  value: string;
  stage: 'Discovery' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closing';
  status: 'Hot' | 'Warm' | 'Cold';
  lastContact: string;
  email: string;
  phone: string;
  assignedTo?: string;
  assignedToName?: string;
  notes: Array<{ content: string; author: string; createdAt: string }>;
  emails: Array<{
    subject: string;
    body: string;
    sender: string;
    sentAt: string;
    scheduledAt?: string;
    status: 'sent' | 'scheduled' | 'opened' | 'clicked' | 'replied';
    opens: number;
    clicks: number;
  }>;
  documents: Array<{ name: string; size: string; url: string; uploadedAt: string }>;
  history: Array<{ event: string; user: string; time: string }>;
  activeSequence?: string;
  sequenceStep?: number;
};

export default function CRM() {
  const { showToast } = useUI();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  
  // Modals & Dynamic State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalTab, setModalTab] = useState<'timeline' | 'notes' | 'outreach' | 'documents' | 'history'>('timeline');

  // Input states for new lead
  const [nlName, setNlName] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlCompany, setNlCompany] = useState('');
  const [nlPhone, setNlPhone] = useState('');
  const [nlValue, setNlValue] = useState('5000');
  const [nlStatus, setNlStatus] = useState<'Hot' | 'Warm' | 'Cold'>('Warm');
  const [nlStage, setNlStage] = useState<'Discovery' | 'Contacted' | 'Qualified'>('Discovery');
  const [nlAssigned, setNlAssigned] = useState('Maya Thompson');

  // Input states for outreach
  const [outSubject, setOutSubject] = useState('');
  const [outBody, setOutBody] = useState('');
  const [outTemplate, setOutTemplate] = useState('Custom Email');
  const [outScheduled, setOutScheduled] = useState('');
  
  // Input states for notes
  const [newNote, setNewNote] = useState('');

  // Refs
  const csvInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const STAGES = ['Discovery', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closing'];

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        // Refresh selected lead if open
        if (selectedLead) {
          const updated = data.leads.find((l: Lead) => l._id === selectedLead._id);
          if (updated) setSelectedLead(updated);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load leads from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedItem) return;
    const lead = leads.find(l => l._id === draggedItem);
    if (!lead) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggedItem,
          action: 'update_stage',
          stage: targetStage,
          currentUser: 'Maya Thompson'
        })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => l._id === draggedItem ? { ...l, stage: targetStage as any } : l));
        showToast(`Moved ${lead.name} to ${targetStage}`, 'success');
        triggerActivityLog('workflow_action', `Lead ${lead.name} moved to ${targetStage}`);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
    setDraggedItem(null);
  };

  const handleCreateLead = async () => {
    if (!nlName || !nlEmail) {
      showToast('Lead name and email are required', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nlName,
          email: nlEmail,
          company: nlCompany,
          phone: nlPhone,
          value: `$${parseFloat(nlValue).toLocaleString()}`,
          status: nlStatus,
          stage: nlStage,
          assignedToName: nlAssigned
        })
      });
      const data = await res.json();
      if (data.success) {
        setLeads([data.lead, ...leads]);
        setIsAddModalOpen(false);
        setNlName(''); setNlEmail(''); setNlCompany(''); setNlPhone(''); setNlValue('5000');
        showToast('Lead created and added to pipeline!', 'success');
        triggerActivityLog('workflow_action', `Created lead ${nlName}`);
      } else {
        showToast(data.error || 'Failed to create lead', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote || !selectedLead) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead._id,
          action: 'add_note',
          content: newNote,
          currentUser: 'Maya Thompson'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewNote('');
        showToast('Note successfully logged to lead timeline!', 'success');
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !outSubject || !outBody) {
      showToast('Subject and body are required to dispatch email', 'warning');
      return;
    }

    try {
      showToast(outScheduled ? 'Scheduling email delivery...' : 'Transmitting email...', 'info');
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead._id,
          to: selectedLead.email,
          subject: outSubject,
          htmlContent: `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${outBody.replace(/\n/g, '<br/>')}</div>`,
          scheduledAt: outScheduled || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(outScheduled ? 'Email scheduled successfully!' : 'Email dispatched successfully!', 'success');
        setOutSubject(''); setOutBody(''); setOutScheduled('');
        fetchLeads();
      } else {
        showToast(data.error || 'Failed to dispatch email', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        showToast('Processing lead records...', 'info');
        const res = await fetch('/api/leads/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            csvData: text,
            currentUser: 'Maya Thompson'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          fetchLeads();
        } else {
          showToast(data.error || 'CSV Parsing failed', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        showToast('Uploading secure document...', 'info');
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: selectedLead._id,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileData: base64Data,
            currentUser: 'Maya Thompson'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Document uploaded and shared successfully!', 'success');
          fetchLeads();
        } else {
          showToast(data.error || 'Upload failed', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const templates = {
    'Custom Email': { subject: '', body: '' },
    'Introductory Pitch': {
      subject: 'Exploring marketing growth opportunities for {{company}}',
      body: 'Hi {{name}},\n\nI’ve been following {{company}} and noticed your recent initiatives. We specialize in dynamic operations and campaign scalability.\n\nWould you be open to a brief conversation next Tuesday to see how we can assist?\n\nBest regards,\nMaya Thompson'
    },
    'Proposal Nudge': {
      subject: 'Quick follow-up regarding proposal options',
      body: 'Hi {{name}},\n\nJust wanted to make sure you had a chance to look over the service levels proposal I forwarded.\n\nLet me know if any questions popped up or if we should customize any terms.\n\nBest,\nMaya'
    },
    'Contract MSA Finalization': {
      subject: 'MSA and SLA agreements ready for signing',
      body: 'Hi {{name}},\n\nSuper excited to get started! I’ve uploaded the Master Service Agreement to your portal.\n\nPlease review and let me know if we are good to execute.\n\nTalk soon,\nMaya'
    }
  };

  const applyTemplate = (templateName: string) => {
    setOutTemplate(templateName);
    if (!selectedLead) return;
    const t = (templates as any)[templateName];
    if (t) {
      setOutSubject(t.subject.replace('{{company}}', selectedLead.company).replace('{{name}}', selectedLead.name));
      setOutBody(t.body.replace('{{company}}', selectedLead.company).replace('{{name}}', selectedLead.name));
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-base text-primary overflow-hidden transition-colors">
      
      {/* Hidden File Inputs */}
      <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleCSVImport} />
      <input type="file" ref={docInputRef} className="hidden" onChange={handleDocUpload} />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0 border-b border-border bg-base z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">CRM Pipeline</h1>
            <p className="text-secondary text-sm font-medium">Manage leads, track deals, and automate follow-ups.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => csvInputRef.current?.click()} className="px-4 py-2.5 border border-border bg-surface text-primary rounded-xl text-xs font-semibold hover:bg-base transition-all shadow-sm flex items-center gap-2">
                <Upload size={14} /> Import CSV (Leads)
             </button>
             <button onClick={() => { downloadCSV(leads, 'CRM_Leads'); triggerActivityLog('file_download', 'Exported CRM Leads to CSV'); }} className="px-4 py-2.5 border border-border bg-surface text-primary rounded-xl text-xs font-semibold hover:bg-base transition-all shadow-sm flex items-center gap-2">
                <Download size={14} /> Export CSV
             </button>
             <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-bold shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:bg-indigo-600 transition-all active:scale-95">
                <Plus size={16} /> Add Lead
             </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex bg-surface border border-border rounded-xl p-1 shadow-inner">
             <button onClick={() => setView('board')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === 'board' ? 'bg-base text-accent shadow-sm ring-1 ring-border/50' : 'text-secondary hover:text-primary'}`}>
               <LayoutGrid size={14} /> Board View
             </button>
             <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === 'list' ? 'bg-base text-accent shadow-sm ring-1 ring-border/50' : 'text-secondary hover:text-primary'}`}>
               <List size={14} /> List View
             </button>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..." 
                  className="bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-primary font-medium"
                />
             </div>
             <button className="p-2 border border-border rounded-xl bg-surface text-secondary hover:text-primary transition-colors">
               <Filter size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-secondary font-bold text-sm">Synchronizing sales pipelines...</div>
        ) : view === 'board' ? (
          <div className="h-full overflow-x-auto p-8 bg-base/30 relative shadow-inner custom-scrollbar snap-x scroll-smooth">
            <div className="flex gap-6 h-full min-w-max p-1 pb-4">
              {STAGES.map(stage => {
                const isCurrentOver = dragOverStage === stage;
                const isAnyDragging = draggedItem !== null;
                const stageLeads = filteredLeads.filter(l => l.stage === stage);
                
                return (
                  <div 
                    key={stage} 
                    className={`flex flex-col w-[320px] rounded-3xl border-2 transition-all duration-200 p-2 bg-surface/20 shrink-0 snap-center ${
                      isCurrentOver 
                        ? 'border-accent bg-accent/[0.04] shadow-lg shadow-accent/5 scale-[1.01]' 
                        : isAnyDragging 
                          ? 'border-dashed border-border bg-surface/10' 
                          : 'border-transparent'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStage !== stage) setDragOverStage(stage);
                    }}
                    onDragLeave={() => setDragOverStage(null)}
                    onDrop={(e) => {
                      handleDrop(e, stage);
                      setDragOverStage(null);
                    }}
                  >
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${
                          stage === 'Discovery' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
                          stage === 'Contacted' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 
                          stage === 'Qualified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                          stage === 'Proposal' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                          stage === 'Negotiation' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 
                          'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        }`} />
                        <h3 className="font-extrabold text-xs text-primary uppercase tracking-widest leading-none">{stage}</h3>
                      </div>
                      <span className="text-[10px] font-black bg-surface border border-border text-secondary px-2.5 py-0.5 rounded-full shadow-sm leading-none">{stageLeads.length}</span>
                    </div>

                    {/* Column Body / Cards Container */}
                    <div className="p-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
                      <AnimatePresence>
                        {stageLeads.map(lead => {
                          const initials = lead.assignedToName ? lead.assignedToName.split(' ').map(n => n[0]).join('') : 'UN';
                          const getAvatarColor = (name: string = '') => {
                            const colors = [
                              'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/10',
                              'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/10',
                              'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border-pink-500/10',
                              'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/10',
                              'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border-sky-500/10'
                            ];
                            let sum = 0;
                            for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
                            return colors[sum % colors.length];
                          };

                          return (
                            <motion.div
                              key={lead._id}
                              layout
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileHover={{ y: -4, scale: 1.01 }}
                              transition={{ duration: 0.2 }}
                              draggable
                              onDragStart={() => setDraggedItem(lead._id || null)}
                              onDragEnd={() => {
                                setDraggedItem(null);
                                setDragOverStage(null);
                              }}
                              onClick={() => { setSelectedLead(lead); setModalTab('timeline'); }}
                              className="bg-surface border border-border/80 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-accent hover:shadow-lg hover:shadow-accent/[0.03] transition-all group shadow-sm flex flex-col gap-3"
                            >
                              {/* Card Header Info */}
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                  lead.status === 'Hot' ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400' : 
                                  lead.status === 'Warm' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400' : 
                                  'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400'
                                }`}>{lead.status}</span>
                                
                                <div className="flex gap-2">
                                  {lead.notes && lead.notes.length > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-tertiary font-bold" title="Internal notes count">
                                      <MessageSquare size={10} /> {lead.notes.length}
                                    </span>
                                  )}
                                  {lead.emails && lead.emails.length > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-tertiary font-bold" title="Outreach emails sent">
                                      <Mail size={10} /> {lead.emails.length}
                                    </span>
                                  )}
                                  {lead.documents && lead.documents.length > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-tertiary font-bold" title="Documents attached">
                                      <Paperclip size={10} /> {lead.documents.length}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Titles */}
                              <div>
                                <h4 className="text-sm font-extrabold text-primary group-hover:text-accent transition-colors leading-snug tracking-tight mb-0.5 truncate">{lead.name}</h4>
                                <p className="text-[10px] font-bold text-secondary truncate uppercase tracking-widest">{lead.company}</p>
                              </div>
                              
                              {/* Card Bottom Meta */}
                              <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                                <div className="text-sm font-black text-accent">{lead.value}</div>
                                
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border ${getAvatarColor(lead.assignedToName)}`} title={`Owner: ${lead.assignedToName || 'Unassigned'}`}>
                                    {initials}
                                  </div>
                                  <span className="text-[8px] font-black text-tertiary uppercase tracking-wider truncate max-w-[80px]">
                                    {lead.lastContact || 'Just now'}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 overflow-y-auto h-full bg-base/30 shadow-inner">
            <div className="rounded-2xl border border-border bg-base shadow-sm overflow-hidden">
               <table className="w-full text-left text-xs">
                 <thead className="bg-surface border-b border-border text-secondary font-bold uppercase tracking-widest">
                   <tr>
                     <th className="px-6 py-4">Lead Name</th>
                     <th className="px-6 py-4">Stage</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Deal Value</th>
                     <th className="px-6 py-4">Assigned Representative</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {filteredLeads.map(lead => (
                      <tr key={lead._id} className="hover:bg-surface/50 transition-colors group cursor-pointer" onClick={() => { setSelectedLead(lead); setModalTab('timeline'); }}>
                        <td className="px-6 py-4">
                           <div className="font-bold text-sm text-primary group-hover:text-accent transition-colors">{lead.name}</div>
                           <div className="text-[11px] font-medium text-secondary mt-0.5">{lead.company} · {lead.email}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-base border border-border font-bold text-[10px]">
                              <div className={`w-1.5 h-1.5 rounded-full ${lead.stage === 'Discovery' ? 'bg-blue-500' : lead.stage === 'Contacted' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                              {lead.stage}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${
                             lead.status === 'Hot' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                             lead.status === 'Warm' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' : 
                             'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
                           }`}>{lead.status}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-accent text-sm">{lead.value}</td>
                        <td className="px-6 py-4 text-secondary font-bold uppercase tracking-wider">{lead.assignedToName || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); showToast(`Calling ${lead.name}`, 'info'); }} className="p-2 bg-base border border-border rounded-lg hover:text-accent transition-colors"><Phone size={14}/></button>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setModalTab('outreach'); }} className="p-2 bg-base border border-border rounded-lg hover:text-accent transition-colors"><Mail size={14}/></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-5xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px]">
              {/* Sidebar Info */}
              <div className="w-full md:w-80 border-r border-border bg-base/50 p-8 flex flex-col gap-6 shrink-0 overflow-y-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-3xl font-black text-accent mb-4 shadow-inner">
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-xl font-extrabold text-primary mb-1 tracking-tight">{selectedLead.name}</h2>
                  <p className="text-xs font-bold text-secondary mb-2 uppercase tracking-widest">{selectedLead.company}</p>
                  <p className="text-[11px] font-bold text-tertiary mb-4">{selectedLead.email}</p>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    selectedLead.status === 'Hot' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                    selectedLead.status === 'Warm' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                    'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  }`}>{selectedLead.status} Lead</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-surface rounded-2xl border border-border hover:border-accent/30 transition-colors shadow-sm">
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2.5 flex items-center gap-2"><Target size={12} className="text-accent" /> Stage</h4>
                    <select 
                      value={selectedLead.stage}
                      onChange={async (e) => {
                        const newStage = e.target.value;
                        const res = await fetch('/api/leads', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: selectedLead._id, action: 'update_stage', stage: newStage, currentUser: 'Maya Thompson' })
                        });
                        if (res.ok) {
                          showToast(`Stage updated to ${newStage}`, 'success');
                          fetchLeads();
                        }
                      }}
                      className="w-full bg-base border border-border rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-1 focus:ring-accent outline-none cursor-pointer"
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm">
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5">Deal Value</h4>
                    <div className="text-xl font-black text-accent">{selectedLead.value}</div>
                  </div>
                  <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm">
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5"><User size={12} className="text-accent" /> Owner</h4>
                    <div className="text-xs font-bold text-primary">{selectedLead.assignedToName || 'Unassigned'}</div>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <button onClick={() => showToast(`Dialing ${selectedLead.phone || selectedLead.name}...`, 'info')} className="w-full flex items-center justify-center gap-2 py-3 bg-base border border-border rounded-xl text-xs font-bold hover:border-accent hover:text-accent transition-all active:scale-95"><Phone size={14}/> Call Lead</button>
                  <button onClick={() => setModalTab('outreach')} className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/20 hover:bg-indigo-600 transition-all active:scale-95"><Mail size={14}/> Compose outreach</button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="p-6 border-b border-border flex justify-between items-center bg-base/30">
                  <div className="flex bg-surface border border-border rounded-2xl p-1 shadow-inner overflow-x-auto relative">
                    {[
                      { id: 'timeline', label: 'Timeline' },
                      { id: 'notes', label: `Notes (${selectedLead.notes.length})` },
                      { id: 'outreach', label: 'Outreach & Tracking' },
                      { id: 'documents', label: `Documents (${selectedLead.documents.length})` },
                      { id: 'history', label: 'Audit Log' }
                    ].map(t => {
                      const isTabActive = modalTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setModalTab(t.id as any)}
                          className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all shrink-0 relative ${
                            isTabActive ? 'text-accent' : 'text-secondary hover:text-primary'
                          }`}
                        >
                          <span className="relative z-10">{t.label}</span>
                          {isTabActive && (
                            <motion.span
                              layoutId="activeModalTabCrm"
                              className="absolute inset-0 bg-base border border-border/60 rounded-xl shadow-sm"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-surface rounded-xl text-secondary hover:text-primary transition-colors border border-transparent hover:border-border"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar">
                   {modalTab === 'timeline' && (
                     <>
                        {/* Quick Actions Grid */}
                        <div>
                          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Operations & Follow-up</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <button onClick={() => { setIsProposalModalOpen(true); }} 
                               className="flex items-center gap-4 p-5 bg-base border border-border rounded-2xl hover:border-accent/50 hover:bg-accent/5 transition-all group shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={20}/></div>
                                <div className="text-left"><div className="text-sm font-bold group-hover:text-accent transition-colors">Generate Proposal</div><div className="text-[11px] text-secondary font-medium">Create custom quote & scope</div></div>
                             </button>
                             <button onClick={() => setIsSequenceModalOpen(true)} 
                               className="flex items-center gap-4 p-5 bg-base border border-border rounded-2xl hover:border-accent/50 hover:bg-accent/5 transition-all group shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Zap size={20}/></div>
                                <div className="text-left"><div className="text-sm font-bold group-hover:text-accent transition-colors">Enroll in Sequence</div><div className="text-[11px] text-secondary font-medium">Automated email workflow sequences</div></div>
                             </button>
                          </div>
                        </div>

                        {/* Mixed Activity Timeline */}
                        <div>
                          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Lead Activity & Outbox</h3>
                          <div className="space-y-6 relative pl-6 border-l-2 border-border/50">
                             {selectedLead.emails.map((email, idx) => (
                               <div key={idx} className="relative group">
                                 <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-base bg-blue-500 z-10`}></div>
                                 <div className="bg-base border border-border rounded-2xl p-4 shadow-sm hover:border-accent/30 transition-all">
                                   <div className="flex justify-between items-start mb-2">
                                     <div className="text-sm font-bold text-primary flex items-center gap-2"><Mail size={12} className="text-accent" /> Email Outgoing: {email.subject}</div>
                                     <div className="text-[10px] font-bold text-tertiary">{new Date(email.sentAt).toLocaleDateString()}</div>
                                   </div>
                                   <div className="text-[11px] text-secondary font-medium whitespace-pre-line border-l-2 border-border pl-3 my-2" dangerouslySetInnerHTML={{ __html: email.body }}></div>
                                   <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40 text-[9px] font-bold text-tertiary uppercase">
                                     <span>Status: <span className="text-accent font-black">{email.status}</span></span>
                                     <span className="flex gap-4">
                                       <span>{email.opens} Opens</span>
                                       <span>{email.clicks} Link Clicks</span>
                                     </span>
                                   </div>
                                 </div>
                               </div>
                             ))}
                             {selectedLead.history.slice(0, 5).map((h, i) => (
                               <div key={i} className="relative group">
                                 <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-base bg-emerald-500 z-10`}></div>
                                 <div className="bg-base border border-border rounded-2xl p-4 shadow-sm">
                                   <div className="flex justify-between items-center">
                                     <div className="text-xs font-bold text-primary">{h.event}</div>
                                     <div className="text-[9px] font-bold text-tertiary">{new Date(h.time).toLocaleDateString()}</div>
                                   </div>
                                   <div className="text-[10px] text-secondary font-medium mt-1">Logged by: {h.user}</div>
                                 </div>
                               </div>
                             ))}
                             {selectedLead.emails.length === 0 && selectedLead.history.length === 0 && (
                               <div className="text-center text-secondary font-bold py-6 text-xs">No active timeline events recorded</div>
                             )}
                          </div>
                        </div>
                     </>
                    )}

                    {modalTab === 'notes' && (
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Internal Notes Log</h3>
                        <div className="flex gap-3">
                           <textarea
                             value={newNote}
                             onChange={e => setNewNote(e.target.value)}
                             rows={3}
                             placeholder="Write down details about the deal, requirements, or client feedback..."
                             className="flex-1 bg-base border border-border rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-accent resize-none text-primary shadow-sm"
                           />
                           <button onClick={handleAddNote} className="px-6 bg-accent text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center shadow-md active:scale-95"><Send size={16}/></button>
                        </div>

                        <div className="space-y-4">
                          {selectedLead.notes.map((n, i) => (
                            <div key={i} className="p-4 bg-base border border-border rounded-2xl shadow-sm">
                              <p className="text-xs text-primary font-medium leading-relaxed">{n.content}</p>
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40 text-[9px] font-bold text-tertiary uppercase">
                                <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-[7px]">{n.author[0]}</div>
                                {n.author} · {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                          {selectedLead.notes.length === 0 && (
                            <div className="text-center text-secondary font-bold py-8 text-xs">No notes recorded for this lead yet.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {modalTab === 'outreach' && (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Outreach Composer</h3>
                          <div className="flex gap-2">
                             <select
                               value={outTemplate}
                               onChange={e => applyTemplate(e.target.value)}
                               className="bg-surface border border-border text-xs font-bold px-3 py-1.5 rounded-xl text-primary focus:outline-none"
                             >
                               {Object.keys(templates).map(name => <option key={name} value={name}>{name}</option>)}
                             </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                           <div>
                             <label className="block text-[9px] font-bold text-secondary uppercase mb-1">Email Subject Line</label>
                             <input 
                               type="text" 
                               value={outSubject}
                               onChange={e => setOutSubject(e.target.value)}
                               placeholder="Scope of work..."
                               className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-accent outline-none text-primary"
                             />
                           </div>
                           <div>
                             <label className="block text-[9px] font-bold text-secondary uppercase mb-1">Rich Text Composer</label>
                             <textarea 
                               rows={8}
                               value={outBody}
                               onChange={e => setOutBody(e.target.value)}
                               placeholder="Hi, draft your follow up here..."
                               className="w-full bg-base border border-border rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-accent resize-none text-primary"
                             />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <div>
                               <label className="block text-[9px] font-bold text-secondary uppercase mb-1">Schedule Future Send (Optional)</label>
                               <input 
                                 type="datetime-local" 
                                 value={outScheduled}
                                 onChange={e => setOutScheduled(e.target.value)}
                                 className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-1 focus:ring-accent outline-none text-primary"
                               />
                             </div>
                             <div className="flex items-end justify-end gap-3 mt-4 md:mt-0">
                               <button 
                                 onClick={handleSendEmail}
                                 className="px-8 py-3 bg-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                               >
                                 <Send size={14} /> {outScheduled ? 'Schedule Outbox' : 'Send Direct'}
                               </button>
                             </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {modalTab === 'documents' && (
                      <div className="space-y-4">
                         <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Shared Documents & Contracts</h3>
                         {selectedLead.documents.map((doc, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-base border border-border rounded-2xl hover:border-accent/30 transition-all group shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center"><FileText size={18}/></div>
                                 <div>
                                    <div className="text-sm font-bold group-hover:text-accent transition-colors">{doc.name}</div>
                                    <div className="text-[10px] text-secondary font-medium">{doc.size} · Shared {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { window.open(doc.url, '_blank'); showToast('Opening document', 'info'); }}
                                  className="p-2 text-secondary hover:text-accent transition-colors"
                                  title="View Securely"
                                >
                                  <ChevronRight size={16}/>
                                </button>
                                <button 
                                  onClick={() => { downloadCSV([doc], doc.name); showToast('Downloading document...', 'info'); }} 
                                  className="p-2 text-secondary hover:text-accent transition-colors"
                                  title="Download"
                                >
                                  <Download size={16}/>
                                </button>
                              </div>
                           </div>
                         ))}
                         <button onClick={() => docInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-xs font-bold text-secondary hover:text-accent hover:border-accent/50 transition-all mt-4">+ Upload Proposal Contract</button>
                      </div>
                    )}

                    {modalTab === 'history' && (
                      <div className="space-y-6">
                         <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Complete Audit Log</h3>
                         <div className="space-y-4">
                           {selectedLead.history.map((log, i) => (
                             <div key={i} className="flex items-start gap-4 p-4 bg-base/50 border border-border rounded-2xl shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-accent shadow-inner">{log.user[0] || 'S'}</div>
                                <div className="flex-1">
                                   <div className="text-sm font-bold text-primary">{log.event}</div>
                                   <div className="flex justify-between items-center mt-1">
                                      <div className="text-[10px] text-secondary font-medium">Actor: {log.user}</div>
                                      <div className="text-[10px] text-tertiary font-bold">{new Date(log.time).toLocaleString()}</div>
                                   </div>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-base/30 flex justify-end gap-3">
                   <button onClick={() => setSelectedLead(null)} className="px-8 py-2.5 bg-surface border border-border text-primary font-bold rounded-xl hover:bg-base hover:border-accent transition-all text-xs active:scale-95 shadow-sm">Close Record</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-border flex justify-between items-center bg-base/50">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Target size={18} className="text-accent" /> New Pipeline Lead</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-base rounded-xl text-secondary hover:text-primary transition-colors"><X size={20}/></button>
               </div>
               <div className="p-8 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Lead Name *</label>
                    <input type="text" value={nlName} onChange={e=>setNlName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent transition-all font-medium text-sm text-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Lead Email *</label>
                    <input type="email" value={nlEmail} onChange={e=>setNlEmail(e.target.value)} placeholder="sarah@company.com" className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent transition-all font-medium text-sm text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Company</label>
                      <input type="text" value={nlCompany} onChange={e=>setNlCompany(e.target.value)} placeholder="Acme Inc" className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent transition-all font-medium text-sm text-primary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Deal Value ($)</label>
                      <input type="number" value={nlValue} onChange={e=>setNlValue(e.target.value)} placeholder="5000" className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent transition-all font-medium text-sm text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input type="text" value={nlPhone} onChange={e=>setNlPhone(e.target.value)} placeholder="+1 555-0199" className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent transition-all font-medium text-sm text-primary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Assign Representative</label>
                      <select value={nlAssigned} onChange={e=>setNlAssigned(e.target.value)} className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent font-bold text-sm text-primary">
                         <option>Maya Thompson</option>
                         <option>Priya Patel</option>
                         <option>Mateo Rivera</option>
                         <option>Jordan Lee</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Pipeline Stage</label>
                      <select value={nlStage} onChange={e=>setNlStage(e.target.value as any)} className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent font-bold text-sm text-primary">
                         <option>Discovery</option>
                         <option>Contacted</option>
                         <option>Qualified</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5">Lead Priority</label>
                      <select value={nlStatus} onChange={e=>setNlStatus(e.target.value as any)} className="w-full px-5 py-3 border border-border bg-base rounded-2xl focus:outline-none focus:border-accent font-bold text-sm text-primary">
                         <option>Warm</option>
                         <option>Hot</option>
                         <option>Cold</option>
                      </select>
                    </div>
                  </div>
               </div>
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-base/50">
                  <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-secondary hover:text-primary transition-colors">Cancel</button>
                  <button onClick={handleCreateLead} className="px-10 py-2.5 bg-accent text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 text-xs">Create Lead</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal Modal */}
      <AnimatePresence>
        {isProposalModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-border flex justify-between items-center bg-base/50">
                  <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={18} className="text-orange-500" /> Secure Proposal Generator</h2>
                  <button onClick={() => setIsProposalModalOpen(false)} className="p-2 hover:bg-base rounded-xl text-secondary hover:text-primary transition-colors"><X size={20}/></button>
               </div>
               <div className="p-8">
                  <h3 className="text-sm font-bold mb-4">Select Proposal Template</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                     {[
                       { name: 'Standard SaaS Retainer', type: 'Annual' },
                       { name: 'Managed Services MSA', type: 'Enterprise' },
                       { name: 'Quick Pilot Proposal', type: 'Pilot' },
                       { name: 'Development SOW', type: 'Project' }
                     ].map((t, i) => (
                       <button key={i} onClick={() => showToast(`${t.name} selected`, 'info')} className="p-4 border border-border bg-base rounded-2xl text-left hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group shadow-sm">
                          <div className="text-xs font-bold text-primary group-hover:text-orange-600 transition-colors mb-1">{t.name}</div>
                          <div className="text-[10px] text-secondary font-medium uppercase tracking-widest">{t.type}</div>
                       </button>
                     ))}
                  </div>
                  <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                     <p className="text-xs text-orange-600 font-bold mb-2">Proposal Inclusions</p>
                     <p className="text-[11px] text-secondary font-medium leading-relaxed">This template automatically compiles: Scope of Operations, Deliverables schedule, SLA performance guarantees, Pricing structure, and an e-sign consent block.</p>
                  </div>
               </div>
                <div className="p-6 border-t border-border flex justify-end gap-3 bg-base/50">
                  <button onClick={() => setIsProposalModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-secondary hover:text-primary transition-colors">Close</button>
                  <button onClick={async () => { 
                    if (!selectedLead) return;
                    try {
                      const res = await fetch('/api/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          leadId: selectedLead._id,
                          to: selectedLead.email,
                          subject: `Proposal Proposal - Ops Platform`,
                          htmlContent: `<h2>Hi ${selectedLead.name},</h2><p>Here is your Operations proposal. Please review the pricing levels and return to execute.</p>`
                        })
                      });
                      if (res.ok) {
                        showToast('Secure proposal dispatched via email!', 'success');
                        triggerActivityLog('report_generation', `Dispatched proposal to ${selectedLead.name}`);
                        setIsProposalModalOpen(false);
                        fetchLeads();
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }} className="px-8 py-2.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 text-xs">Generate & Send</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sequence Modal */}
      <AnimatePresence>
        {isSequenceModalOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}} className="bg-surface w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-border flex justify-between items-center bg-base/50">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Zap size={18} className="text-purple-500" /> Automation Sequence Engine</h2>
                  <button onClick={() => setIsSequenceModalOpen(false)} className="p-2 hover:bg-base rounded-xl text-secondary hover:text-primary transition-colors"><X size={20}/></button>
               </div>
               <div className="p-8">
                  <h3 className="text-sm font-bold mb-6">Enroll in Email Sequence</h3>
                  <div className="space-y-4">
                     {[
                       { name: 'Warm Intro Sequence', steps: 5, days: 12, color: 'bg-emerald-500' },
                       { name: 'Follow-up After Demo', steps: 3, days: 7, color: 'bg-blue-500' },
                       { name: 'Long-term Nurturing', steps: 8, days: 60, color: 'bg-purple-500' },
                     ].map((s, i) => (
                       <button key={i} onClick={async () => {
                         if (!selectedLead) return;
                         try {
                           showToast(`Enrolling lead in ${s.name}...`, 'info');
                           const res = await fetch('/api/email/send', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               leadId: selectedLead._id,
                               to: selectedLead.email,
                               subject: `Warm welcome from Antigravity Operations`,
                               htmlContent: `<p>Hi ${selectedLead.name}, hope you are doing well!</p>`,
                               sequenceName: s.name
                             })
                           });
                           if (res.ok) {
                             showToast(`Enrolled in automation sequence: ${s.name}`, 'success');
                             setIsSequenceModalOpen(false);
                             fetchLeads();
                           }
                         } catch (err) {
                           console.error(err);
                         }
                       }} className="w-full flex items-center justify-between p-5 bg-base border border-border rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group shadow-sm animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-10 rounded-full ${s.color}`}></div>
                            <div className="text-left">
                              <div className="text-sm font-bold group-hover:text-purple-600 transition-colors">{s.name}</div>
                              <div className="text-[10px] text-secondary font-medium uppercase tracking-widest">{s.steps} Emails · {s.days} Days</div>
                            </div>
                          </div>
                          <Send size={16} className="text-tertiary group-hover:text-purple-600 transition-all group-hover:translate-x-1" />
                       </button>
                     ))}
                  </div>
               </div>
               <div className="p-6 border-t border-border flex justify-end bg-base/50">
                  <button onClick={() => setIsSequenceModalOpen(false)} className="px-10 py-2.5 bg-surface border border-border text-primary font-bold rounded-2xl hover:bg-base hover:border-accent transition-all active:scale-95 text-xs shadow-sm">Close</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
