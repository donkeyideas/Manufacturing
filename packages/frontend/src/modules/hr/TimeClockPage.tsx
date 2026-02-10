import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { getTimeEntries } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TimeClockPage() {
  const [timeEntries, setTimeEntries] = useState(() => getTimeEntries());
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [employee, setEmployee] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEmployee('');
    setEntryDate('');
    setClockIn('');
    setClockOut('');
    setNotes('');
  };

  const handleSubmit = () => {
    const id = `TE-${String(timeEntries.length + 900).padStart(3, '0')}`;
    const dateStr = entryDate || '2024-12-15';
    const inTime = clockIn || '08:00';
    const outTime = clockOut || '17:00';
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const totalHours = Math.max(0, (outH + outM / 60) - (inH + inM / 60));
    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);
    const newEntry = {
      id,
      employeeName: employee || 'New Employee',
      entryDate: dateStr,
      clockInTime: `${dateStr}T${inTime}:00`,
      clockOutTime: `${dateStr}T${outTime}:00`,
      hoursWorked: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      taskDescription: notes || 'Manual entry',
      isApproved: false,
      employeeId: `emp-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    };
    setTimeEntries([newEntry, ...timeEntries]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'employeeName',
        header: 'Employee',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.employeeName}
          </span>
        ),
      },
      {
        accessorKey: 'entryDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {formatDate(row.original.entryDate)}
          </span>
        ),
      },
      {
        accessorKey: 'clockInTime',
        header: 'Clock In',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {formatTime(row.original.clockInTime)}
          </span>
        ),
      },
      {
        accessorKey: 'clockOutTime',
        header: 'Clock Out',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {formatTime(row.original.clockOutTime)}
          </span>
        ),
      },
      {
        accessorKey: 'hoursWorked',
        header: 'Hours Worked',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-text-primary">
            {row.original.hoursWorked}h
          </span>
        ),
      },
      {
        accessorKey: 'regularHours',
        header: 'Regular',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.regularHours}h
          </span>
        ),
      },
      {
        accessorKey: 'overtimeHours',
        header: 'Overtime',
        cell: ({ row }) => (
          <span className={`text-xs ${row.original.overtimeHours > 0 ? 'text-orange-500 font-medium' : 'text-text-secondary'}`}>
            {row.original.overtimeHours}h
          </span>
        ),
      },
      {
        accessorKey: 'taskDescription',
        header: 'Task',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary min-w-[200px]">
            {row.original.taskDescription}
          </span>
        ),
      },
      {
        accessorKey: 'isApproved',
        header: 'Approved',
        cell: ({ row }) => (
          <Badge variant={row.original.isApproved ? 'success' : 'warning'}>
            {row.original.isApproved ? 'Yes' : 'No'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Time Clock</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track employee clock-in/clock-out and hours worked
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Manual Entry
        </Button>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={timeEntries} />
        </CardContent>
      </Card>

      {/* Manual Entry SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Manual Entry"
        description="Add a manual time clock entry"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Employee</label>
            <input className={INPUT_CLS} placeholder="Employee name" value={employee} onChange={e => setEmployee(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
            <input className={INPUT_CLS} type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Clock In Time</label>
              <input className={INPUT_CLS} type="time" value={clockIn} onChange={e => setClockIn(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Clock Out Time</label>
              <input className={INPUT_CLS} type="time" value={clockOut} onChange={e => setClockOut(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Notes</label>
            <textarea className={INPUT_CLS + ' min-h-[60px]'} placeholder="Task or notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
