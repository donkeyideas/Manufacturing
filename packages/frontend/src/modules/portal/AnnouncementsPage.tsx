import { useMemo } from 'react';
import { Card, CardContent, Badge } from '@erp/ui';
import { useCompanyAnnouncements } from '../../data-layer/hooks/usePortal';
import type { CompanyAnnouncement } from '@erp/shared';

const priorityStyles: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  high: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

function groupByDate(announcements: CompanyAnnouncement[]): Record<string, CompanyAnnouncement[]> {
  const groups: Record<string, CompanyAnnouncement[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const ann of announcements) {
    const pubDate = new Date(ann.publishedAt);
    let group: string;

    if (pubDate >= today) {
      group = 'Today';
    } else if (pubDate >= weekAgo) {
      group = 'This Week';
    } else {
      group = 'Earlier';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(ann);
  }

  return groups;
}

export default function AnnouncementsPage() {
  const { data: announcementsData } = useCompanyAnnouncements();
  const announcements = useMemo(() => announcementsData ?? [], [announcementsData]);

  const grouped = useMemo(() => groupByDate(announcements), [announcements]);
  const groupOrder = ['Today', 'This Week', 'Earlier'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Announcements</h1>
        <p className="text-xs text-text-muted">Company news and updates</p>
      </div>

      {groupOrder.map((groupName) => {
        const items = grouped[groupName];
        if (!items || items.length === 0) return null;

        return (
          <div key={groupName} className="space-y-3">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              {groupName}
            </h2>

            {items.map((ann) => (
              <Card
                key={ann.id}
                className={!ann.isRead ? 'border-l-4 border-l-blue-500' : ''}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {ann.title}
                        </h3>
                        {!ann.isRead && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span>{ann.author}</span>
                        {ann.department && (
                          <>
                            <span className="text-border">&middot;</span>
                            <span>{ann.department}</span>
                          </>
                        )}
                        <span className="text-border">&middot;</span>
                        <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={priorityStyles[ann.priority]}>
                      {ann.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}

      {announcements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-text-muted">No announcements yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
