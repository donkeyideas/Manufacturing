import { useState, useMemo } from 'react';
import {
  Inbox as InboxIcon, Search, Star, Mail,
  CheckCheck, Archive, Reply, Phone, Building2, MapPin,
} from 'lucide-react';
import { Card, Badge, cn } from '@erp/ui';

type Status = 'new' | 'read' | 'replied' | 'resolved';
type Filter = 'all' | 'unread' | 'starred';

interface Message {
  id: string;
  sender: string;
  email: string;
  company: string;
  phone: string;
  location: string;
  subject: string;
  body: string;
  time: string;
  unread: boolean;
  starred: boolean;
  status: Status;
}

const STATUS_VARIANT: Record<Status, 'info' | 'default' | 'primary' | 'success'> = {
  new: 'info',
  read: 'default',
  replied: 'primary',
  resolved: 'success',
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'starred', label: 'Starred' },
];

export function Inbox() {
  const initial = useMemo<Message[]>(() => [
    { id: 'm-1', sender: 'James Morrison', email: 'james@morrisonauto.com', company: 'Morrison Auto Group', phone: '(312) 555-0142', location: 'Chicago, IL', subject: 'Partnership Inquiry - Automotive Parts', body: 'We are interested in exploring a partnership for automotive parts manufacturing. Our company produces 50,000+ units annually and we\'re looking for a reliable manufacturing partner who can meet our quality standards and delivery timelines. We\'d love to set up an introductory call to discuss potential collaboration.', time: '2 hours ago', unread: true, starred: false, status: 'new' },
    { id: 'm-2', sender: 'Sarah Chen', email: 'sarah.chen@techflow.com', company: 'TechFlow Industries', phone: '(408) 555-0198', location: 'San Jose, CA', subject: 'RFQ: Custom CNC Components', body: 'I\'d like to request a quote for custom CNC machined components. We need approximately 2,000 units of a precision aluminum housing with tight tolerances (+/- 0.001"). I\'ve attached the CAD files and specifications. Could you provide a quote with lead times for both prototype and production runs?', time: '5 hours ago', unread: true, starred: false, status: 'new' },
    { id: 'm-3', sender: 'Michael Rodriguez', email: 'm.rodriguez@pacificmfg.com', company: 'Pacific Manufacturing Corp', phone: '(206) 555-0167', location: 'Seattle, WA', subject: 'Demo Request - Enterprise Plan', body: 'Our team is evaluating ERP solutions and we\'d like to schedule a live demo of your Enterprise plan. We have 150+ employees across 3 facilities and need a solution that handles multi-site inventory, production scheduling, and financial consolidation. What times work this week?', time: 'Yesterday', unread: true, starred: false, status: 'new' },
    { id: 'm-4', sender: 'Emily Watson', email: 'emily@databridge.io', company: 'DataBridge Solutions', phone: '(617) 555-0234', location: 'Boston, MA', subject: 'Technical Question - API Integration', body: 'We\'re currently using your platform and have questions about the REST API capabilities. Specifically, we need to integrate with our existing WMS (warehouse management system) to sync inventory levels in real-time. Does your API support webhook notifications for inventory changes?', time: 'Yesterday', unread: true, starred: false, status: 'new' },
    { id: 'm-5', sender: 'Alex Kim', email: 'alex@novamakers.com', company: 'NovaMakers LLC', phone: '(512) 555-0189', location: 'Austin, TX', subject: 'Pricing Inquiry - Startup Plan', body: 'We\'re a startup manufacturing company and would like to learn more about your pricing options. We currently have 12 employees and produce custom 3D-printed parts. Is there a plan that fits early-stage companies? We\'d also like to know about any onboarding support included.', time: '2 days ago', unread: true, starred: false, status: 'new' },
    { id: 'm-6', sender: 'Lisa Park', email: 'lisa.park@precisiondyn.com', company: 'Precision Dynamics', phone: '(714) 555-0156', location: 'Irvine, CA', subject: 'Feedback: Great Onboarding Experience', body: 'I wanted to reach out and share that our onboarding experience has been excellent. Your team guided us through every step of the setup process, from data migration to workflow configuration. Our production team was up and running within two weeks. Thank you for the outstanding support!', time: '3 days ago', unread: false, starred: false, status: 'read' },
    { id: 'm-7', sender: 'Robert Turner', email: 'r.turner@atlasindustrial.com', company: 'Atlas Industrial', phone: '(216) 555-0178', location: 'Cleveland, OH', subject: 'Support: Invoice Export Issue', body: 'We\'re experiencing an issue with the invoice export feature. When we try to export invoices to PDF format, the formatting is broken and some fields are missing. This is affecting our accounts receivable workflow. Could your support team look into this urgently?', time: '4 days ago', unread: false, starred: false, status: 'read' },
    { id: 'm-8', sender: 'Diana Morales', email: 'd.morales@continentalmfg.com', company: 'Continental Mfg Group', phone: '(305) 555-0145', location: 'Miami, FL', subject: 'Bulk Licensing Inquiry', body: 'We\'re looking to roll out your platform across our 8 manufacturing sites. Could you provide information about bulk licensing discounts and enterprise deployment options? We\'d need approximately 400 user seats with admin controls for each site manager.', time: '5 days ago', unread: false, starred: true, status: 'read' },
    { id: 'm-9', sender: "Kevin O'Brien", email: 'kevin@greenfieldprod.com', company: 'Greenfield Products', phone: '(503) 555-0123', location: 'Portland, OR', subject: 'Feature Request: Barcode Scanning', body: 'We love the inventory management module but would really benefit from native barcode scanning support on mobile devices. Our warehouse team currently uses a separate app for scanning, and having it built into your platform would streamline our receiving and shipping processes significantly.', time: 'Dec 8', unread: false, starred: false, status: 'read' },
    { id: 'm-10', sender: 'Jennifer Hayes', email: 'jennifer@mfgtechsummit.com', company: 'MfgTech Summit 2025', phone: '(737) 555-0201', location: 'Austin, TX', subject: 'Conference Speaking Opportunity', body: 'We\'d like to invite your team to speak at the MfgTech Summit 2025 in Austin, TX. The event brings together 2,000+ manufacturing leaders and we think your insights on modern ERP implementation would resonate with our audience. The speaking slot is 30 minutes plus Q&A.', time: 'Dec 7', unread: false, starred: true, status: 'read' },
    { id: 'm-11', sender: 'Thomas Wright', email: 't.wright@cloudsync.io', company: 'CloudSync IO', phone: '(415) 555-0167', location: 'San Francisco, CA', subject: 'Integration Partner Application', body: 'CloudSync IO would like to apply to become an integration partner. Our platform specializes in real-time data synchronization between cloud services and on-premise systems. We believe a native integration would benefit mutual customers in the manufacturing sector.', time: 'Dec 5', unread: false, starred: false, status: 'read' },
    { id: 'm-12', sender: 'Amanda Foster', email: 'amanda@accessfirst.org', company: 'AccessFirst Consulting', phone: '(202) 555-0134', location: 'Washington, DC', subject: 'Website Accessibility Feedback', body: 'During our review of your website, we noticed a few accessibility improvements that could enhance the experience for users with disabilities. Specifically, some form labels are missing, contrast ratios on secondary text could be improved, and keyboard navigation in the pricing table needs attention.', time: 'Dec 3', unread: false, starred: false, status: 'read' },
  ], []);

  const [messages, setMessages] = useState<Message[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const unreadCount = messages.filter((m) => m.unread).length;

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === 'unread' && !m.unread) return false;
      if (filter === 'starred' && !m.starred) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.company.toLowerCase().includes(q);
      }
      return true;
    });
  }, [messages, filter, search]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const selectMessage = (id: string) => {
    setSelectedId(id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, unread: false, status: m.status === 'new' ? 'read' : m.status } : m));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false, status: m.status === 'new' ? 'read' : m.status })));
  };

  const markResolved = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: 'resolved' } : m));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text-primary">Inbox</h1>
          {unreadCount > 0 && <Badge variant="info">{unreadCount} new</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors">
            <CheckCheck className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />Mark All Read
          </button>
          <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={cn('rounded-md px-3 py-1 text-xs font-medium transition-colors', filter === f.key ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary')}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <input type="text" placeholder="Search by name, subject, or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-border bg-surface-0 pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left panel - Message list */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-border">
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <InboxIcon className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No messages found.</p>
              </div>
            )}
            {filtered.map((m) => (
              <button key={m.id} onClick={() => selectMessage(m.id)} className={cn('w-full text-left px-4 py-3 transition-colors hover:bg-surface-2', selectedId === m.id && 'bg-brand-50 dark:bg-brand-500/10')}>
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="pt-1.5 w-2 shrink-0">
                    {m.unread && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-xs truncate', m.unread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary')}>{m.sender}</span>
                      <span className="text-2xs text-text-muted shrink-0">{m.time}</span>
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', m.unread ? 'font-medium text-text-primary' : 'text-text-secondary')}>{m.subject}</p>
                    <p className="text-2xs text-text-muted truncate mt-0.5">{m.body}</p>
                  </div>
                  {/* Star */}
                  <button onClick={(e) => toggleStar(m.id, e)} className="shrink-0 pt-0.5 text-text-muted hover:text-amber-500 transition-colors">
                    <Star className={cn('h-3.5 w-3.5', m.starred && 'fill-amber-400 text-amber-400')} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Right panel - Message detail */}
        <Card className="lg:col-span-3">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Mail className="h-10 w-10 text-text-muted mb-3" />
              <p className="text-sm text-text-muted">Select a message to view details</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">{selected.subject}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-medium text-text-primary">{selected.sender}</span>
                    <span className="text-2xs text-text-muted">&lt;{selected.email}&gt;</span>
                  </div>
                  <p className="text-2xs text-text-muted mt-0.5">{selected.company} &middot; {selected.time}</p>
                </div>
                <Badge variant={STATUS_VARIANT[selected.status]}>{selected.status}</Badge>
              </div>

              {/* Body */}
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{selected.body}</p>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <Phone className="h-3.5 w-3.5" />{selected.phone}
                </div>
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <Building2 className="h-3.5 w-3.5" />{selected.company}
                </div>
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <MapPin className="h-3.5 w-3.5" />{selected.location}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
                  <Reply className="h-3.5 w-3.5" />Reply via Email
                </button>
                <button onClick={() => markResolved(selected.id)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors">
                  <CheckCheck className="h-3.5 w-3.5" />Mark as Resolved
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors">
                  <Archive className="h-3.5 w-3.5" />Archive
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
