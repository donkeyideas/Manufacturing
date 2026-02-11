import { useState, useMemo } from 'react';
import { Ticket, Clock, Timer, ThumbsUp, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, KPICard, SlideOver, Button } from '@erp/ui';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'default',
};

const STATUS_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'default'> = {
  Open: 'danger',
  'In Progress': 'warning',
  Resolved: 'success',
  Closed: 'default',
};

export default function TicketsOverview() {
  const { isDemo } = useAppMode();

  const categories = useMemo(() => isDemo ? [
    { label: 'IT / Hardware', count: 8 },
    { label: 'Software / Access', count: 6 },
    { label: 'Facilities', count: 4 },
    { label: 'HR Questions', count: 3 },
    { label: 'Safety', count: 2 },
  ] : [], [isDemo]);

  const priorities = useMemo(() => isDemo ? [
    { label: 'Critical', count: 3, bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    { label: 'High', count: 7, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Medium', count: 9, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Low', count: 4, bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400' },
  ] : [], [isDemo]);

  const DEMO_TICKETS = [
    { id: 'TKT-2024-0145', subject: 'CNC Machine G-Code Upload Error', submittedBy: 'John Miller', category: 'IT/Hardware', priority: 'High', status: 'Open', created: 'Dec 14' },
    { id: 'TKT-2024-0144', subject: 'ERP Access Request - New Hire', submittedBy: 'Sarah Johnson', category: 'Software/Access', priority: 'Medium', status: 'In Progress', created: 'Dec 13' },
    { id: 'TKT-2024-0143', subject: 'Warehouse Door #3 Stuck', submittedBy: 'Mike Torres', category: 'Facilities', priority: 'High', status: 'Open', created: 'Dec 13' },
    { id: 'TKT-2024-0142', subject: 'Payroll Discrepancy Q4', submittedBy: 'Lisa Chen', category: 'HR Questions', priority: 'Medium', status: 'In Progress', created: 'Dec 12' },
    { id: 'TKT-2024-0141', subject: 'Safety Guard Missing on Press #7', submittedBy: 'David Park', category: 'Safety', priority: 'Critical', status: 'Open', created: 'Dec 12' },
    { id: 'TKT-2024-0140', subject: 'Inventory Scanner Not Syncing', submittedBy: 'Amy Rodriguez', category: 'IT/Hardware', priority: 'High', status: 'In Progress', created: 'Dec 11' },
    { id: 'TKT-2024-0139', subject: 'VPN Connection Issues', submittedBy: 'Tom Bradley', category: 'Software/Access', priority: 'Low', status: 'Resolved', created: 'Dec 10' },
    { id: 'TKT-2024-0138', subject: 'Break Room AC Unit', submittedBy: 'Karen White', category: 'Facilities', priority: 'Low', status: 'Closed', created: 'Dec 9' },
  ];

  const [tickets, setTickets] = useState(isDemo ? DEMO_TICKETS : [] as typeof DEMO_TICKETS);

  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [subject, setSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('IT/Hardware');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setSubject('');
    setTicketCategory('IT/Hardware');
    setTicketPriority('Medium');
    setDescription('');
  };

  const handleSubmit = () => {
    if (!subject.trim()) return;
    const newTicket = {
      id: `TKT-2024-${String(tickets.length + 500).padStart(4, '0')}`,
      subject: subject.trim(),
      submittedBy: 'Current User',
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      created: 'Dec 15',
    };
    setTickets((prev) => [newTicket, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const maxCategory = categories.length > 0 ? Math.max(...categories.map((c) => c.count)) : 1;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Support Tickets</h1>
          <p className="text-xs text-text-muted mt-0.5">Track and manage internal support requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Open Tickets" value={isDemo ? '23' : '0'} trend={isDemo ? 'up' : undefined} trendValue={isDemo ? '+3' : undefined} trendIsPositive={false} icon={<Ticket className="h-4 w-4" />} />
        <KPICard label="In Progress" value={isDemo ? '12' : '0'} trend={isDemo ? 'down' : undefined} trendValue={isDemo ? '-2' : undefined} trendIsPositive icon={<Clock className="h-4 w-4" />} />
        <KPICard label="Avg Resolution Time" value={isDemo ? '4.2 hrs' : '--'} trend={isDemo ? 'down' : undefined} trendValue={isDemo ? '-18%' : undefined} trendIsPositive icon={<Timer className="h-4 w-4" />} />
        <KPICard label="Satisfaction Rate" value={isDemo ? '94%' : '--'} trend={isDemo ? 'up' : undefined} trendValue={isDemo ? '+2.1%' : undefined} trendIsPositive icon={<ThumbsUp className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Tickets by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-text-secondary truncate">{cat.label}</span>
                  <div className="flex-1 h-5 rounded bg-surface-2 overflow-hidden">
                    <div className="h-full rounded bg-brand-500 transition-all" style={{ width: `${(cat.count / maxCategory) * 100}%` }} />
                  </div>
                  <span className="w-6 text-xs font-medium text-text-primary text-right">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tickets by Priority</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {priorities.map((p) => (
                <div key={p.label} className={`rounded-lg p-4 ${p.bg}`}>
                  <p className={`text-2xl font-bold ${p.text}`}>{p.count}</p>
                  <p className={`text-xs font-medium mt-1 ${p.text}`}>{p.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Tickets</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-text-muted">Ticket #</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Subject</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Submitted By</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Category</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Priority</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Status</th>
                  <th className="pb-2 text-xs font-medium text-text-muted">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 text-xs text-brand-600 font-medium">{t.id}</td>
                    <td className="py-2.5 text-xs text-text-primary">{t.subject}</td>
                    <td className="py-2.5 text-xs text-text-secondary">{t.submittedBy}</td>
                    <td className="py-2.5 text-xs text-text-secondary">{t.category}</td>
                    <td className="py-2.5"><Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge></td>
                    <td className="py-2.5"><Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge></td>
                    <td className="py-2.5 text-xs text-text-muted">{t.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Ticket SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Ticket"
        description="Submit a new support ticket"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Subject *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. CNC Machine G-Code Upload Error"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select
              className={INPUT_CLS}
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
            >
              <option value="IT/Hardware">IT / Hardware</option>
              <option value="Software/Access">Software / Access</option>
              <option value="Facilities">Facilities</option>
              <option value="HR Questions">HR Questions</option>
              <option value="Safety">Safety</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
            <select
              className={INPUT_CLS}
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <textarea
              className={INPUT_CLS}
              rows={4}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
