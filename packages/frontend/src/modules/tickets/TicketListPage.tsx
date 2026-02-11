import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Badge, cn } from '@erp/ui';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

type Ticket = {
  id: string; subject: string; submittedBy: string; category: string;
  priority: string; status: string; created: string;
};

const PRIORITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  Critical: 'danger', High: 'warning', Medium: 'info', Low: 'default',
};
const STATUS_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'default'> = {
  Open: 'danger', 'In Progress': 'warning', Resolved: 'success', Closed: 'default',
};
const PRIORITY_BORDER: Record<string, string> = {
  Critical: 'border-l-red-500', High: 'border-l-amber-500', Medium: 'border-l-blue-500', Low: 'border-l-gray-400',
};

const ALL_TICKETS: Ticket[] = [
  { id: 'TKT-2024-0145', subject: 'CNC Machine G-Code Upload Error', submittedBy: 'John Miller', category: 'IT/Hardware', priority: 'High', status: 'Open', created: 'Dec 14' },
  { id: 'TKT-2024-0144', subject: 'ERP Access Request - New Hire', submittedBy: 'Sarah Johnson', category: 'Software/Access', priority: 'Medium', status: 'In Progress', created: 'Dec 13' },
  { id: 'TKT-2024-0143', subject: 'Warehouse Door #3 Stuck', submittedBy: 'Mike Torres', category: 'Facilities', priority: 'High', status: 'Open', created: 'Dec 13' },
  { id: 'TKT-2024-0142', subject: 'Payroll Discrepancy Q4', submittedBy: 'Lisa Chen', category: 'HR Questions', priority: 'Medium', status: 'In Progress', created: 'Dec 12' },
  { id: 'TKT-2024-0141', subject: 'Safety Guard Missing on Press #7', submittedBy: 'David Park', category: 'Safety', priority: 'Critical', status: 'Open', created: 'Dec 12' },
  { id: 'TKT-2024-0140', subject: 'Inventory Scanner Not Syncing', submittedBy: 'Amy Rodriguez', category: 'IT/Hardware', priority: 'High', status: 'In Progress', created: 'Dec 11' },
  { id: 'TKT-2024-0139', subject: 'VPN Connection Issues', submittedBy: 'Tom Bradley', category: 'Software/Access', priority: 'Low', status: 'Resolved', created: 'Dec 10' },
  { id: 'TKT-2024-0138', subject: 'Break Room AC Unit', submittedBy: 'Karen White', category: 'Facilities', priority: 'Low', status: 'Closed', created: 'Dec 9' },
  { id: 'TKT-2024-0137', subject: 'Forklift Battery Replacement', submittedBy: 'Jim Hayes', category: 'Facilities', priority: 'Medium', status: 'Open', created: 'Dec 8' },
  { id: 'TKT-2024-0136', subject: 'MES System Timeout Errors', submittedBy: 'Rachel Kim', category: 'Software/Access', priority: 'High', status: 'In Progress', created: 'Dec 7' },
  { id: 'TKT-2024-0135', subject: 'Office Printer Jam - 2nd Floor', submittedBy: 'Steve Nelson', category: 'IT/Hardware', priority: 'Low', status: 'Resolved', created: 'Dec 6' },
  { id: 'TKT-2024-0134', subject: 'Chemical Spill Kit Restocking', submittedBy: 'Maria Gonzalez', category: 'Safety', priority: 'Critical', status: 'Resolved', created: 'Dec 5' },
  { id: 'TKT-2024-0133', subject: 'Overtime Approval Process', submittedBy: "Kevin O'Brien", category: 'HR Questions', priority: 'Medium', status: 'Closed', created: 'Dec 4' },
  { id: 'TKT-2024-0132', subject: 'Barcode Label Printer Setup', submittedBy: 'Angela Davis', category: 'IT/Hardware', priority: 'Medium', status: 'Closed', created: 'Dec 3' },
  { id: 'TKT-2024-0131', subject: 'Emergency Exit Sign Replacement', submittedBy: 'Robert Chen', category: 'Safety', priority: 'High', status: 'Resolved', created: 'Dec 2' },
];

const selectClass = 'rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500';

export default function TicketListPage() {
  const { isDemo } = useAppMode();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const tickets = useMemo(() => isDemo ? ALL_TICKETS : [], [isDemo]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      if (q && !t.subject.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.submittedBy.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">All Tickets</h1>
        <p className="text-xs text-text-muted mt-0.5">View and filter all support tickets</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text" placeholder="Search tickets..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-0 pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={selectClass}>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          {['All', 'IT/Hardware', 'Software/Access', 'Facilities', 'HR Questions', 'Safety'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-xs text-text-muted">
        Showing {filtered.length} of {tickets.length} tickets
      </p>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-lg border border-border bg-surface-1 p-4 hover:bg-surface-2 transition-colors cursor-pointer border-l-4',
              PRIORITY_BORDER[t.priority],
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-600 font-medium">{t.id}</span>
                  <span className="text-sm font-medium text-text-primary truncate">{t.subject}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {t.submittedBy} &middot; {t.category} &middot; {t.created}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">No tickets match your filters.</p>
        )}
      </div>
    </div>
  );
}
