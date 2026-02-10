import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, cn } from '@erp/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShiftSchedule } from '../../data-layer/hooks/usePortal';
import type { ShiftSchedule } from '@erp/shared';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const shiftColors: Record<string, { bg: string; border: string; text: string }> = {
  day: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  evening: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
  },
  night: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
  },
  flexible: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SchedulePage() {
  const { data: scheduleData } = useShiftSchedule();
  const [weekOffset, setWeekOffset] = useState(0);

  const shifts = useMemo(() => scheduleData ?? [], [scheduleData]);

  const currentWeekStart = useMemo(() => {
    const now = new Date();
    const start = getWeekStart(now);
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    return DAY_NAMES.map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  const weekLabel = useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4);
    return `${formatDateShort(currentWeekStart)} - ${formatDateShort(end)}`;
  }, [currentWeekStart]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof shifts> = {};
    for (const shift of shifts) {
      if (!map[shift.date]) map[shift.date] = [];
      map[shift.date].push(shift);
    }
    return map;
  }, [shifts]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">My Schedule</h1>
        <p className="text-xs text-text-muted">View your weekly shift schedule</p>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <CardTitle>{weekLabel}</CardTitle>
            <button
              onClick={() => setWeekOffset((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {weekDates.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayShifts = shiftsByDate[dateStr] ?? [];
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  className={cn(
                    'rounded-lg border p-3 min-h-[120px]',
                    isToday ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-primary">
                      {DAY_NAMES[i]}
                    </span>
                    <span className={cn(
                      'text-xs',
                      isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-text-muted'
                    )}>
                      {formatDateShort(date)}
                    </span>
                  </div>

                  {dayShifts.length > 0 ? (
                    dayShifts.map((shift: ShiftSchedule) => {
                      const colors = shiftColors[shift.shiftType] ?? shiftColors.flexible;
                      return (
                        <div
                          key={shift.id}
                          className={cn(
                            'rounded-md border p-2 mb-1',
                            colors.bg, colors.border
                          )}
                        >
                          <p className={cn('text-xs font-semibold', colors.text)}>
                            {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {shift.department}
                          </p>
                          {shift.workCenter && (
                            <p className="text-xs text-text-muted">
                              {shift.workCenter}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-text-muted italic">No shift</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(shiftColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded-sm border', colors.bg, colors.border)} />
            <span className="text-xs text-text-muted capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
