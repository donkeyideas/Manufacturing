import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertTriangle, CheckCircle2, Info, XCircle,
  ArrowRight, Check,
} from 'lucide-react';
import { cn, Badge } from '@erp/ui';
import type { AppNotification } from '@erp/shared';
import { getNotifications } from '@erp/demo-data';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

const TYPE_COLORS = {
  info: 'text-blue-500',
  warning: 'text-amber-500',
  success: 'text-emerald-500',
  error: 'text-red-500',
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notification.id ? { ...n, read: true } : n)
    );
    if (notification.actionLink) {
      navigate(notification.actionLink);
      setOpen(false);
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-border bg-surface-1 shadow-lg animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <h3 className="text-xs font-semibold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-2xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type];
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors border-b border-border last:border-0',
                    !notification.read && 'bg-brand-50/50 dark:bg-brand-950/30'
                  )}
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', TYPE_COLORS[notification.type])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-xs text-text-primary truncate',
                        !notification.read && 'font-medium'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-2xs text-text-muted mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-2xs text-text-muted mt-1">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-3 py-2">
            <button
              onClick={() => { navigate('/settings/notifications'); setOpen(false); }}
              className="w-full text-center text-2xs text-brand-600 dark:text-brand-400 font-medium py-1 hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
