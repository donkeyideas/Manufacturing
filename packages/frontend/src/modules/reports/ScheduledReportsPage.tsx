import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, SlideOver, Button } from '@erp/ui';
import { getScheduledReports } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function ScheduledReportsPage() {
  const [scheduled, setScheduled] = useState(() => getScheduledReports());
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('financial');
  const [frequency, setFrequency] = useState('weekly');
  const [recipients, setRecipients] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');

  const resetForm = () => {
    setReportName('');
    setReportType('financial');
    setFrequency('weekly');
    setRecipients('');
    setReportFormat('pdf');
  };

  const handleSubmit = () => {
    if (!reportName.trim()) return;
    const recipientList = recipients
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    const newReport = {
      id: `sched-${Date.now()}`,
      reportId: `rpt-${Date.now()}`,
      reportName: reportName.trim(),
      frequency,
      nextRunAt: '2024-12-16T08:00:00Z',
      lastRunAt: '2024-12-09T08:00:00Z',
      recipients: recipientList.length > 0 ? recipientList : ['admin@company.com'],
      format: reportFormat,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setScheduled((prev) => [newReport, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'reportName',
        header: 'Report Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.reportName}</span>
        ),
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
        cell: ({ row }) => {
          const freq = row.original.frequency;
          const variant =
            freq === 'daily'
              ? 'info'
              : freq === 'weekly'
              ? 'success'
              : freq === 'monthly'
              ? 'primary'
              : 'default';

          return (
            <Badge variant={variant}>
              {freq}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'nextRunAt',
        header: 'Next Run',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.nextRunAt), 'MMM dd, yyyy HH:mm')}
          </span>
        ),
      },
      {
        accessorKey: 'lastRunAt',
        header: 'Last Run',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.lastRunAt), 'MMM dd, yyyy HH:mm')}
          </span>
        ),
      },
      {
        accessorKey: 'recipients',
        header: 'Recipients',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.recipients.length} recipient{row.original.recipients.length !== 1 ? 's' : ''}
          </span>
        ),
      },
      {
        accessorKey: 'format',
        header: 'Format',
        cell: ({ row }) => {
          const fmt = row.original.format;
          return (
            <Badge variant={fmt === 'pdf' ? 'danger' : 'success'}>
              {fmt.toUpperCase()}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Scheduled Reports</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage automated report generation and delivery schedules
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Schedule Report
        </button>
      </div>

      {/* Scheduled Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={scheduled} />
        </CardContent>
      </Card>

      {/* Schedule Report SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Schedule Report"
        description="Set up an automated report schedule"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Report Name *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Monthly P&L Statement"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select
              className={INPUT_CLS}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="financial">Financial</option>
              <option value="inventory">Inventory</option>
              <option value="sales">Sales</option>
              <option value="procurement">Procurement</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="hr">HR</option>
              <option value="assets">Assets</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Frequency</label>
            <select
              className={INPUT_CLS}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Recipients (comma-separated emails)</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. sarah@company.com, cfo@company.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Format</label>
            <select
              className={INPUT_CLS}
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
