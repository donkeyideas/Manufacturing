import { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock,
  Package, DollarSign, Truck, Factory, Users, FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, cn, SlideOver } from '@erp/ui';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

/* ---------- Types ---------- */
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  description: string;
  type: 'system' | 'custom';
}

/* ---------- Category colours ---------- */
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Purchase Orders': { bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-500',   text: 'text-blue-700 dark:text-blue-300' },
  Invoices:          { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  'Work Orders':     { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
  Shipments:         { bg: 'bg-amber-50 dark:bg-amber-950',  border: 'border-amber-500',  text: 'text-amber-700 dark:text-amber-300' },
  'HR/Leave':        { bg: 'bg-pink-50 dark:bg-pink-950',    border: 'border-pink-500',   text: 'text-pink-700 dark:text-pink-300' },
  Maintenance:       { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
  Custom:            { bg: 'bg-gray-50 dark:bg-gray-900',    border: 'border-gray-400',   text: 'text-gray-700 dark:text-gray-300' },
  Meetings:          { bg: 'bg-cyan-50 dark:bg-cyan-950',    border: 'border-cyan-500',   text: 'text-cyan-700 dark:text-cyan-300' },
};

const CATEGORY_DOT: Record<string, string> = {
  'Purchase Orders': 'bg-blue-500',
  Invoices:          'bg-emerald-500',
  'Work Orders':     'bg-purple-500',
  Shipments:         'bg-amber-500',
  'HR/Leave':        'bg-pink-500',
  Maintenance:       'bg-orange-500',
  Custom:            'bg-gray-400',
  Meetings:          'bg-cyan-500',
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  'Purchase Orders': <Package className="h-3.5 w-3.5" />,
  Invoices:          <DollarSign className="h-3.5 w-3.5" />,
  'Work Orders':     <Factory className="h-3.5 w-3.5" />,
  Shipments:         <Truck className="h-3.5 w-3.5" />,
  'HR/Leave':        <Users className="h-3.5 w-3.5" />,
  Maintenance:       <FileText className="h-3.5 w-3.5" />,
  Custom:            <Calendar className="h-3.5 w-3.5" />,
  Meetings:          <Users className="h-3.5 w-3.5" />,
};

const CATEGORIES = [
  'Purchase Orders',
  'Invoices',
  'Work Orders',
  'Shipments',
  'HR/Leave',
  'Maintenance',
  'Custom',
  'Meetings',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ---------- Time slots for Week/Day views ---------- */
const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 21; h++) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  TIME_SLOTS.push(`${hour12} ${ampm}`);
}

/* ---------- Helpers ---------- */
function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function pad(n: number) { return n.toString().padStart(2, '0'); }
function fmtDate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

function parseHour(time: string): number {
  const [hStr] = time.split(':');
  return parseInt(hStr, 10);
}

function formatTime12(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m} ${ampm}`;
}

function getWeekDates(dateStr: string): Date[] {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${FULL_DAYS[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatWeekRange(dateStr: string): string {
  const dates = getWeekDates(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const first = dates[0];
  const last = dates[6];
  if (first.getMonth() === last.getMonth()) {
    return `${months[first.getMonth()]} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
  }
  return `${months[first.getMonth()]} ${first.getDate()} - ${months[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
}

const inputClass = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

/* ---------- Demo events ---------- */
const DEMO_EVENTS: CalendarEvent[] = [
  { id: 'e1',  title: 'PO-2024-0891 Due',              date: '2024-12-02', time: '09:00', category: 'Purchase Orders', description: 'Purchase order for raw steel due',           type: 'system' },
  { id: 'e2',  title: 'Invoice #INV-4521 Due',          date: '2024-12-03', time: '10:00', category: 'Invoices',        description: 'Payment due from Delta Industries',         type: 'system' },
  { id: 'e3',  title: 'Team Standup',                   date: '2024-12-04', time: '08:30', category: 'Meetings',        description: 'Daily manufacturing team sync',             type: 'custom' },
  { id: 'e4',  title: 'WO-789 Start Date',              date: '2024-12-05', time: '07:00', category: 'Work Orders',     description: 'Begin production run for order WO-789',     type: 'system' },
  { id: 'e5',  title: 'Quarterly Safety Review',        date: '2024-12-06', time: '14:00', category: 'Meetings',        description: 'Q4 safety compliance review meeting',       type: 'custom' },
  { id: 'e6',  title: 'PO-2024-0895 Due',               date: '2024-12-07', time: '09:00', category: 'Purchase Orders', description: 'Electronic components delivery',            type: 'system' },
  { id: 'e7',  title: 'Shipment SH-445 Arrival',        date: '2024-12-09', time: '11:00', category: 'Shipments',       description: 'Inbound shipment from overseas vendor',     type: 'system' },
  { id: 'e8',  title: 'Annual Leave - Sarah Johnson',   date: '2024-12-10', time: '00:00', category: 'HR/Leave',        description: 'Approved annual leave Dec 10-12',           type: 'system' },
  { id: 'e9',  title: 'Annual Leave - Sarah Johnson',   date: '2024-12-11', time: '00:00', category: 'HR/Leave',        description: 'Approved annual leave Dec 10-12',           type: 'system' },
  { id: 'e10', title: 'Machine PM-102 Maintenance',     date: '2024-12-11', time: '06:00', category: 'Maintenance',     description: 'Scheduled preventive maintenance',          type: 'system' },
  { id: 'e11', title: 'Annual Leave - Sarah Johnson',   date: '2024-12-12', time: '00:00', category: 'HR/Leave',        description: 'Approved annual leave Dec 10-12',           type: 'system' },
  { id: 'e12', title: 'Board Meeting',                  date: '2024-12-13', time: '10:00', category: 'Meetings',        description: 'Monthly board of directors meeting',        type: 'custom' },
  { id: 'e13', title: 'Vendor Payment Batch',           date: '2024-12-15', time: '15:00', category: 'Invoices',        description: 'Process vendor payment batch',              type: 'system' },
  { id: 'e14', title: 'ISO Audit Preparation',          date: '2024-12-16', time: '09:00', category: 'Custom',          description: 'Prepare documentation for ISO 9001 audit',  type: 'custom' },
  { id: 'e15', title: 'Shipment SH-460 Dispatch',       date: '2024-12-17', time: '08:00', category: 'Shipments',       description: 'Outbound shipment to West Coast client',    type: 'system' },
  { id: 'e16', title: 'WO-801 Completion Deadline',     date: '2024-12-18', time: '17:00', category: 'Work Orders',     description: 'Deadline for work order WO-801',            type: 'system' },
  { id: 'e17', title: 'Holiday Party',                  date: '2024-12-20', time: '18:00', category: 'Custom',          description: 'Company holiday celebration',               type: 'custom' },
  { id: 'e18', title: 'Year-End Inventory Count',       date: '2024-12-22', time: '06:00', category: 'Work Orders',     description: 'Annual physical inventory count',           type: 'system' },
  { id: 'e19', title: 'PO-2024-0905 Due',               date: '2024-12-23', time: '09:00', category: 'Purchase Orders', description: 'Packaging materials delivery',              type: 'system' },
  { id: 'e20', title: 'Christmas Eve - Office Closed',  date: '2024-12-24', time: '00:00', category: 'HR/Leave',        description: 'Company holiday - office closed',           type: 'system' },
  { id: 'e21', title: 'Christmas Day - Office Closed',  date: '2024-12-25', time: '00:00', category: 'HR/Leave',        description: 'Company holiday - office closed',           type: 'system' },
  { id: 'e22', title: 'WO-815 Start Date',              date: '2024-12-27', time: '07:00', category: 'Work Orders',     description: 'Begin Q1 pre-production run',               type: 'system' },
  { id: 'e23', title: 'Year-End Financial Close',       date: '2024-12-30', time: '09:00', category: 'Invoices',        description: 'Close books for fiscal year 2024',          type: 'system' },
  { id: 'e24', title: "New Year's Eve - Half Day",      date: '2024-12-31', time: '00:00', category: 'HR/Leave',        description: 'Office closes at 12 PM',                   type: 'system' },
];

export default function CalendarPage() {
  const { isDemo } = useAppMode();
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [selectedDate, setSelectedDate] = useState<string>('2024-12-10');
  const [events, setEvents] = useState<CalendarEvent[]>(isDemo ? DEMO_EVENTS : []);
  const [addEventOpen, setAddEventOpen] = useState(false);

  /* ---------- Add Event form state ---------- */
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newDescription, setNewDescription] = useState('');

  function handleAddEvent() {
    if (!newTitle.trim() || !newDate) return;
    const event: CalendarEvent = {
      id: `e${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      time: newTime,
      category: newCategory,
      description: newDescription.trim(),
      type: 'custom',
    };
    setEvents((prev) => [...prev, event]);
    setNewTitle('');
    setNewDate('');
    setNewTime('09:00');
    setNewCategory('Custom');
    setNewDescription('');
    setAddEventOpen(false);
  }

  function openAddEvent() {
    setNewTitle('');
    setNewDate(selectedDate);
    setNewTime('09:00');
    setNewCategory('Custom');
    setNewDescription('');
    setAddEventOpen(true);
  }

  /* ---------- Navigation ---------- */
  function navigatePrev() {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'Month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'Week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(dateToStr(d));
  }

  function navigateNext() {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'Month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'Week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(dateToStr(d));
  }

  /* ---------- Calendar grid data (Month view) ---------- */
  const selDateObj = new Date(selectedDate + 'T12:00:00');
  const year = selDateObj.getFullYear();
  const month = selDateObj.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const prevMonthDays = daysInMonth(year, month === 0 ? 11 : month - 1);

  const cells = useMemo(() => {
    const grid: { day: number; current: boolean; dateStr: string }[] = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      grid.push({ day: d, current: false, dateStr: fmtDate(prevYear, prevMonth, d) });
    }
    // Current month
    for (let d = 1; d <= totalDays; d++) {
      grid.push({ day: d, current: true, dateStr: fmtDate(year, month, d) });
    }
    // Next month padding
    const remaining = 7 - (grid.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        grid.push({ day: d, current: false, dateStr: fmtDate(nextYear, nextMonth, d) });
      }
    }
    return grid;
  }, [startDay, prevMonthDays, totalDays, year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [events]);

  /* Sidebar: events for selected date or next 7 days */
  const sidebarEvents = useMemo(() => {
    const sel = eventsByDate[selectedDate];
    if (sel && sel.length > 0) return sel;
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return sorted.filter((e) => e.date >= selectedDate).slice(0, 8);
  }, [selectedDate, events, eventsByDate]);

  /* ---------- Week view data ---------- */
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const weekDateStrs = useMemo(() => weekDates.map(dateToStr), [weekDates]);

  /* ---------- Navigation title ---------- */
  function getNavTitle() {
    if (viewMode === 'Month') return formatMonthYear(selectedDate);
    if (viewMode === 'Week') return formatWeekRange(selectedDate);
    return formatFullDate(selectedDate);
  }

  const todayStr = '2024-12-10';

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Calendar</h1>
          <p className="text-xs text-text-muted mt-0.5">Track activities and manage events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
            {(['Month', 'Week', 'Day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  viewMode === v ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={openAddEvent}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={navigatePrev}
          className="rounded-md border border-border bg-surface-0 p-1.5 hover:bg-surface-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-text-muted" />
        </button>
        <span className="text-sm font-semibold text-text-primary">{getNavTitle()}</span>
        <button
          onClick={navigateNext}
          className="rounded-md border border-border bg-surface-0 p-1.5 hover:bg-surface-2 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar area (3 cols) */}
        <Card className="lg:col-span-3">
          <CardContent className="p-3">
            {/* ===== MONTH VIEW ===== */}
            {viewMode === 'Month' && (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-2xs font-medium text-text-muted py-1.5">{d}</div>
                  ))}
                </div>
                {/* Grid cells */}
                <div className="grid grid-cols-7 border-t border-l border-border">
                  {cells.map((cell, idx) => {
                    const dayEvents = eventsByDate[cell.dateStr] ?? [];
                    const isToday = cell.dateStr === todayStr && cell.current;
                    const isSelected = cell.dateStr === selectedDate && cell.current;
                    return (
                      <button
                        key={idx}
                        onClick={() => cell.current && setSelectedDate(cell.dateStr)}
                        className={cn(
                          'min-h-[80px] border-r border-b border-border p-1.5 text-left transition-colors',
                          cell.current ? 'bg-surface-0 hover:bg-surface-2' : 'bg-surface-1',
                          isToday && 'ring-2 ring-inset ring-brand-500',
                          isSelected && !isToday && 'bg-brand-50 dark:bg-brand-950'
                        )}
                      >
                        <span className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          !cell.current && 'text-text-muted opacity-40',
                          cell.current && 'text-text-primary',
                          isToday && 'bg-brand-600 text-white'
                        )}>
                          {cell.day}
                        </span>
                        {/* Event indicators */}
                        <div className="mt-0.5 space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div key={ev.id} className={cn('flex items-center gap-1 rounded px-1 py-0.5', CATEGORY_COLORS[ev.category]?.bg)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', CATEGORY_DOT[ev.category])} />
                              <span className="text-2xs truncate text-text-secondary">{ev.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-2xs text-text-muted pl-1">+{dayEvents.length - 2} more</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ===== WEEK VIEW ===== */}
            {viewMode === 'Week' && (
              <div className="overflow-auto">
                {/* Day headers */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-surface-0 z-10">
                  <div className="p-2" />
                  {weekDates.map((d, i) => {
                    const ds = weekDateStrs[i];
                    const isToday = ds === todayStr;
                    const isSelected = ds === selectedDate;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(ds)}
                        className={cn(
                          'p-2 text-center border-l border-border transition-colors hover:bg-surface-2',
                          isSelected && 'bg-brand-50 dark:bg-brand-950'
                        )}
                      >
                        <div className="text-2xs font-medium text-text-muted">{DAYS[d.getDay()]}</div>
                        <div className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold mt-0.5',
                          isToday ? 'bg-brand-600 text-white' : 'text-text-primary'
                        )}>
                          {d.getDate()}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Time slots */}
                <div className="relative">
                  {TIME_SLOTS.map((label, slotIdx) => {
                    const hour = slotIdx + 6;
                    return (
                      <div key={slotIdx} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border min-h-[56px]">
                        <div className="p-1.5 text-2xs text-text-muted text-right pr-2 pt-1 border-r border-border">
                          {label}
                        </div>
                        {weekDateStrs.map((ds, dayIdx) => {
                          const dayEvents = (eventsByDate[ds] ?? []).filter(
                            (ev) => parseHour(ev.time) === hour
                          );
                          return (
                            <div
                              key={dayIdx}
                              className="border-l border-border p-0.5 relative"
                            >
                              {dayEvents.map((ev) => {
                                const colors = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.Custom;
                                return (
                                  <div
                                    key={ev.id}
                                    className={cn(
                                      'rounded px-1.5 py-1 mb-0.5 border-l-2 text-left',
                                      colors.bg,
                                      colors.border
                                    )}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', CATEGORY_DOT[ev.category])} />
                                      <span className="text-2xs font-medium text-text-primary truncate">{ev.title}</span>
                                    </div>
                                    <span className="text-2xs text-text-muted">{formatTime12(ev.time)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== DAY VIEW ===== */}
            {viewMode === 'Day' && (
              <div className="overflow-auto">
                {/* Day header */}
                <div className="border-b border-border pb-3 mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold',
                      selectedDate === todayStr ? 'bg-brand-600 text-white' : 'bg-surface-2 text-text-primary'
                    )}>
                      {selDateObj.getDate()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        {FULL_DAYS[selDateObj.getDay()]}
                      </div>
                      <div className="text-2xs text-text-muted">
                        {formatMonthYear(selectedDate)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Time slots */}
                {TIME_SLOTS.map((label, slotIdx) => {
                  const hour = slotIdx + 6;
                  const hourEvents = (eventsByDate[selectedDate] ?? []).filter(
                    (ev) => parseHour(ev.time) === hour
                  );
                  return (
                    <div key={slotIdx} className="grid grid-cols-[60px_1fr] border-b border-border min-h-[64px]">
                      <div className="p-1.5 text-xs text-text-muted text-right pr-3 pt-2 border-r border-border font-medium">
                        {label}
                      </div>
                      <div className="p-1.5 space-y-1.5">
                        {hourEvents.map((ev) => {
                          const colors = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.Custom;
                          return (
                            <div
                              key={ev.id}
                              className={cn(
                                'rounded-md border-l-[3px] p-2.5',
                                colors.bg,
                                colors.border
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-text-primary">{ev.title}</p>
                                  <p className="text-2xs text-text-muted mt-0.5">{ev.description}</p>
                                </div>
                                <span className={cn('shrink-0 mt-0.5', colors.text)}>
                                  {CATEGORY_ICON[ev.category]}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-text-muted">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-2xs">{formatTime12(ev.time)}</span>
                                </div>
                                <Badge variant="default" className="text-2xs">{ev.category}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {/* All-day events at bottom or handle time '00:00' events */}
                {(() => {
                  const allDayEvents = (eventsByDate[selectedDate] ?? []).filter(
                    (ev) => ev.time === '00:00'
                  );
                  if (allDayEvents.length === 0) return null;
                  return (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="text-xs font-medium text-text-muted mb-2">All Day</div>
                      <div className="space-y-1.5">
                        {allDayEvents.map((ev) => {
                          const colors = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.Custom;
                          return (
                            <div
                              key={ev.id}
                              className={cn(
                                'rounded-md border-l-[3px] p-2.5',
                                colors.bg,
                                colors.border
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-text-primary">{ev.title}</p>
                                  <p className="text-2xs text-text-muted mt-0.5">{ev.description}</p>
                                </div>
                                <span className={cn('shrink-0 mt-0.5', colors.text)}>
                                  {CATEGORY_ICON[ev.category]}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="default" className="text-2xs">{ev.category}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Sidebar (1 col) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-brand-600" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sidebarEvents.length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">No upcoming events</p>
            )}
            {sidebarEvents.map((ev) => {
              const colors = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.Custom;
              return (
                <div key={ev.id} className={cn('rounded-md border-l-[3px] p-3 bg-surface-1', colors.border)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary leading-snug">{ev.title}</p>
                    <span className={cn('shrink-0', colors.text)}>{CATEGORY_ICON[ev.category]}</span>
                  </div>
                  {ev.time !== '00:00' && (
                    <div className="flex items-center gap-1 mt-1.5 text-text-muted">
                      <Clock className="h-3 w-3" />
                      <span className="text-2xs">{ev.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" className="text-2xs">{ev.category}</Badge>
                    <span className="text-2xs text-text-muted">{ev.date}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ===== ADD EVENT SLIDE-OVER ===== */}
      <SlideOver
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        title="Add Event"
        description="Create a new calendar event"
        width="md"
        footer={
          <>
            <button
              onClick={() => setAddEventOpen(false)}
              className="rounded-md border border-border bg-surface-0 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              disabled={!newTitle.trim() || !newDate}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                newTitle.trim() && newDate
                  ? 'bg-brand-600 hover:bg-brand-700'
                  : 'bg-brand-400 cursor-not-allowed'
              )}
            >
              Add Event
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event title"
              className={inputClass}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Event description (optional)"
              rows={3}
              className={inputClass}
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
