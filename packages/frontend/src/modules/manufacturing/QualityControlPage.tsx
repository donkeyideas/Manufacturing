import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useQualityRecords } from '../../data-layer/hooks/useManufacturing';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const TYPE_VARIANTS = {
  incoming: 'info',
  in_process: 'warning',
  final: 'success',
} as const;

const RESULT_VARIANTS = {
  pass: 'success',
  fail: 'danger',
} as const;

export default function QualityControlPage() {
  const { data: records = [] } = useQualityRecords();
  // TODO: wire create form to a mutation hook instead of local state
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [workOrder, setWorkOrder] = useState('');
  const [productName, setProductName] = useState('');
  const [inspector, setInspector] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspType, setInspType] = useState('incoming');
  const [result, setResult] = useState('pass');

  const resetForm = () => {
    setWorkOrder('');
    setProductName('');
    setInspector('');
    setInspDate('');
    setInspType('incoming');
    setResult('pass');
  };

  const handleSubmit = () => {
    const id = `QC-${String(records.length + 900).padStart(3, '0')}`;
    const newRecord = {
      id,
      inspectionNumber: id,
      workOrderNumber: workOrder || 'WO-001',
      productName: productName || 'New Product',
      inspectionDate: inspDate || '2024-12-15',
      type: inspType as 'incoming' | 'in_process' | 'final',
      result: result as 'pass' | 'fail',
      totalInspected: 100,
      passed: result === 'pass' ? 98 : 85,
      failed: result === 'pass' ? 2 : 15,
      defectRate: result === 'pass' ? 2.0 : 15.0,
      inspectorName: inspector || 'New Inspector',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    };
    // TODO: call create mutation instead of setRecords
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'inspectionNumber',
        header: 'Inspection #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.inspectionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'workOrderNumber',
        header: 'Work Order',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.workOrderNumber}
          </span>
        ),
      },
      {
        accessorKey: 'productName',
        header: 'Product',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.productName}
          </span>
        ),
      },
      {
        accessorKey: 'inspectionDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {new Date(row.original.inspectionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant={
              TYPE_VARIANTS[row.original.type as keyof typeof TYPE_VARIANTS]
            }
          >
            {row.original.type.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: ({ row }) => (
          <Badge
            variant={
              RESULT_VARIANTS[row.original.result as keyof typeof RESULT_VARIANTS]
            }
          >
            {row.original.result}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalInspected',
        header: 'Inspected',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.totalInspected}
          </span>
        ),
      },
      {
        accessorKey: 'passed',
        header: 'Passed',
        cell: ({ row }) => (
          <span className="text-xs text-green-600">
            {row.original.passed}
          </span>
        ),
      },
      {
        accessorKey: 'failed',
        header: 'Failed',
        cell: ({ row }) => (
          <span className={`text-xs ${row.original.failed > 0 ? 'text-red-500' : 'text-text-secondary'}`}>
            {row.original.failed}
          </span>
        ),
      },
      {
        accessorKey: 'defectRate',
        header: 'Defect Rate',
        cell: ({ row }) => (
          <span className={`text-xs ${row.original.defectRate > 5 ? 'text-red-500 font-medium' : 'text-text-primary'}`}>
            {row.original.defectRate.toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: 'inspectorName',
        header: 'Inspector',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.inspectorName}
          </span>
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
          <h1 className="text-lg font-semibold text-text-primary">Quality Control</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage inspections and track product quality
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Inspection
        </Button>
      </div>

      {/* Quality Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quality Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={records} />
        </CardContent>
      </Card>

      {/* New Inspection SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Inspection"
        description="Create a new quality inspection record"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Work Order</label>
            <input className={INPUT_CLS} placeholder="e.g. WO-001" value={workOrder} onChange={e => setWorkOrder(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <input className={INPUT_CLS} placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Inspector</label>
            <input className={INPUT_CLS} placeholder="Inspector name" value={inspector} onChange={e => setInspector(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
            <input className={INPUT_CLS} type="date" value={inspDate} onChange={e => setInspDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select className={INPUT_CLS} value={inspType} onChange={e => setInspType(e.target.value)}>
              <option value="incoming">Incoming</option>
              <option value="in_process">In Process</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Result</label>
            <select className={INPUT_CLS} value={result} onChange={e => setResult(e.target.value)}>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
