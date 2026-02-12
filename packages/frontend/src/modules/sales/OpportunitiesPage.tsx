import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useOpportunities } from '../../data-layer/hooks/useSales';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function OpportunitiesPage() {
  const { data: opportunities = [] } = useOpportunities();
  // TODO: wire create form to a mutation hook instead of local state

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formStage, setFormStage] = useState('discovery');
  const [formCloseDate, setFormCloseDate] = useState('2024-12-31');

  const resetForm = () => {
    setFormName('');
    setFormCustomer('');
    setFormValue('');
    setFormStage('discovery');
    setFormCloseDate('2024-12-31');
  };

  const handleSubmit = () => {
    const probabilityMap: Record<string, number> = {
      discovery: 10,
      qualification: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0,
    };
    const newOpportunity = {
      id: `opp-${String(opportunities.length + 1001).padStart(4, '0')}`,
      opportunityName: formName,
      customerName: formCustomer,
      stage: formStage,
      probability: probabilityMap[formStage] ?? 50,
      value: parseFloat(formValue) || 0,
      expectedCloseDate: formCloseDate,
      assignedTo: 'Current User',
      source: 'Manual Entry',
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2024-12-15T10:00:00Z',
      createdBy: 'user-3',
    };
    // TODO: call create mutation instead of setOpportunities
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'opportunityName',
        header: 'Opportunity',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.opportunityName}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.customerName}</span>
        ),
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ row }) => {
          const stage = row.original.stage;
          const variant =
            stage === 'discovery'
              ? 'default'
              : stage === 'qualification'
              ? 'info'
              : stage === 'proposal'
              ? 'warning'
              : stage === 'negotiation'
              ? 'warning'
              : stage === 'closed_won'
              ? 'success'
              : stage === 'closed_lost'
              ? 'danger'
              : 'default';

          return (
            <Badge variant={variant}>
              {stage.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'probability',
        header: 'Probability',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.probability}%</span>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {formatCurrency(row.original.value)}
          </span>
        ),
      },
      {
        accessorKey: 'expectedCloseDate',
        header: 'Expected Close',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.expectedCloseDate
              ? format(new Date(row.original.expectedCloseDate), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.assignedTo}</span>
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
          <h1 className="text-lg font-semibold text-text-primary">Sales Opportunities</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track and manage sales pipeline opportunities
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Opportunity
        </Button>
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={opportunities} />
        </CardContent>
      </Card>

      {/* New Opportunity SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Opportunity"
        description="Add a new sales opportunity"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Opportunity Name</label>
            <input className={INPUT_CLS} placeholder="e.g. Acme Corp - Q1 Expansion" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
            <input className={INPUT_CLS} placeholder="e.g. Acme Manufacturing" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Value</label>
            <input type="number" className={INPUT_CLS} placeholder="0.00" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Stage</label>
            <select className={INPUT_CLS} value={formStage} onChange={(e) => setFormStage(e.target.value)}>
              <option value="discovery">Discovery</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Expected Close Date</label>
            <input type="date" className={INPUT_CLS} value={formCloseDate} onChange={(e) => setFormCloseDate(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
