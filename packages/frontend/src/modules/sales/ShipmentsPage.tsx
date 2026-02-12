import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver } from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useShipments } from '../../data-layer/hooks/useSales';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function ShipmentsPage() {
  const { data: shipments = [] } = useShipments();
  // TODO: wire create form to a mutation hook instead of local state

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formCarrier, setFormCarrier] = useState('FedEx');
  const [formTrackingNumber, setFormTrackingNumber] = useState('');
  const [formShipDate, setFormShipDate] = useState('2024-12-15');
  const [formStatus, setFormStatus] = useState('pending');

  const resetForm = () => {
    setFormOrderNumber('');
    setFormCarrier('FedEx');
    setFormTrackingNumber('');
    setFormShipDate('2024-12-15');
    setFormStatus('pending');
  };

  const handleSubmit = () => {
    const shpNum = shipments.length + 1001;
    const newShipment = {
      id: `shp-${String(shipments.length + 1001).padStart(4, '0')}`,
      shipmentNumber: `SHP-2024-${String(shpNum).padStart(3, '0')}`,
      salesOrderId: '',
      salesOrderNumber: formOrderNumber,
      customerName: '',
      shipDate: formShipDate,
      carrier: formCarrier,
      trackingNumber: formTrackingNumber || '',
      status: formStatus,
      deliveredDate: '',
      totalWeight: 0,
      weightUnit: 'lbs',
      itemCount: 0,
      createdAt: '2024-12-15T08:00:00Z',
      updatedAt: '2024-12-15T08:00:00Z',
      createdBy: 'user-1',
    };
    // TODO: call create mutation instead of setShipments
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'shipmentNumber',
        header: 'Shipment #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.shipmentNumber}</span>
        ),
      },
      {
        accessorKey: 'salesOrderNumber',
        header: 'Sales Order #',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.salesOrderNumber}</span>
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
        accessorKey: 'carrier',
        header: 'Carrier',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.carrier}</span>
        ),
      },
      {
        accessorKey: 'trackingNumber',
        header: 'Tracking #',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.trackingNumber || '-'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === 'pending'
              ? 'warning'
              : status === 'in_transit'
              ? 'info'
              : status === 'delivered'
              ? 'success'
              : 'default';

          return (
            <Badge variant={variant}>
              {status.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'shipDate',
        header: 'Ship Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.shipDate
              ? format(new Date(row.original.shipDate), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'deliveredDate',
        header: 'Delivered Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.deliveredDate
              ? format(new Date(row.original.deliveredDate), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'itemCount',
        header: 'Items',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.itemCount}</span>
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
          <h1 className="text-lg font-semibold text-text-primary">Shipments</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track and manage all shipments
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Shipment
        </Button>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={shipments} />
        </CardContent>
      </Card>

      {/* New Shipment SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Shipment"
        description="Create a new shipment"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Order #</label>
            <input className={INPUT_CLS} placeholder="e.g. SO-2024-001" value={formOrderNumber} onChange={(e) => setFormOrderNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Carrier</label>
            <select className={INPUT_CLS} value={formCarrier} onChange={(e) => setFormCarrier(e.target.value)}>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="DHL">DHL</option>
              <option value="USPS">USPS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tracking #</label>
            <input className={INPUT_CLS} placeholder="e.g. FX-123456789" value={formTrackingNumber} onChange={(e) => setFormTrackingNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Ship Date</label>
            <input type="date" className={INPUT_CLS} value={formShipDate} onChange={(e) => setFormShipDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
