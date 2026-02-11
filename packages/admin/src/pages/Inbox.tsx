import { useState, useMemo } from 'react';
import {
  Inbox as InboxIcon, Search, Star, Mail,
  CheckCheck, Archive, Reply, Phone, Building2, MapPin,
} from 'lucide-react';
import { Card, Badge, cn } from '@erp/ui';
import {
  useInboxMessages,
  useUpdateMessage,
  useMarkAllRead,
  useDeleteMessage,
  type ContactMessage,
} from '../data-layer/useAdminData';

type Status = 'new' | 'read' | 'replied' | 'resolved';
type Filter = 'all' | 'unread' | 'starred';

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

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Inbox() {
  const { data, isLoading } = useInboxMessages();
  const updateMessage = useUpdateMessage();
  const markAllReadMutation = useMarkAllRead();
  const deleteMessage = useDeleteMessage();

  const messages: ContactMessage[] = data ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === 'unread' && m.isRead) return false;
      if (filter === 'starred' && !m.isStarred) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.sender.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          (m.company ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [messages, filter, search]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const selectMessage = (id: string) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.isRead) {
      updateMessage.mutate({ id, isRead: true, status: 'read' });
    }
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      updateMessage.mutate({ id, isStarred: !msg.isStarred });
    }
  };

  const markAllRead = () => {
    markAllReadMutation.mutate();
  };

  const markResolved = (id: string) => {
    updateMessage.mutate({ id, status: 'resolved' });
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading messages...</p>
        </div>
      </div>
    );
  }

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
                    {!m.isRead && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-xs truncate', !m.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary')}>{m.sender}</span>
                      <span className="text-2xs text-text-muted shrink-0">{formatRelativeTime(m.createdAt)}</span>
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', !m.isRead ? 'font-medium text-text-primary' : 'text-text-secondary')}>{m.subject}</p>
                    <p className="text-2xs text-text-muted truncate mt-0.5">{m.body}</p>
                  </div>
                  {/* Star */}
                  <button onClick={(e) => toggleStar(m.id, e)} className="shrink-0 pt-0.5 text-text-muted hover:text-amber-500 transition-colors">
                    <Star className={cn('h-3.5 w-3.5', m.isStarred && 'fill-amber-400 text-amber-400')} />
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
                  <p className="text-2xs text-text-muted mt-0.5">
                    {selected.company ? `${selected.company} \u00b7 ` : ''}{formatRelativeTime(selected.createdAt)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[selected.status]}>{selected.status}</Badge>
              </div>

              {/* Body */}
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{selected.body}</p>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selected.phone && (
                  <div className="flex items-center gap-2 text-2xs text-text-muted">
                    <Phone className="h-3.5 w-3.5" />{selected.phone}
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-2 text-2xs text-text-muted">
                    <Building2 className="h-3.5 w-3.5" />{selected.company}
                  </div>
                )}
                {selected.location && (
                  <div className="flex items-center gap-2 text-2xs text-text-muted">
                    <MapPin className="h-3.5 w-3.5" />{selected.location}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
                  <Reply className="h-3.5 w-3.5" />Reply via Email
                </button>
                <button onClick={() => markResolved(selected.id)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors">
                  <CheckCheck className="h-3.5 w-3.5" />Mark as Resolved
                </button>
                <button onClick={() => deleteMessage.mutate(selected.id)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors">
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
