import { useMemo, useState } from 'react';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, salesOrderImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useSalesOrders, useCreateSalesOrder, useDeleteSalesOrder, useCustomers, useImportSalesOrders } from '../../data-layer/hooks/useSales';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import type { SalesOrder } from '@erp/shared';
import { format } from 'date-fns';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import GLAccountStrip from '../../components/GLAccountStrip';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
] as const;

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD'] as const;

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'draft': return 'default' as const;
    case 'confirmed': return 'info' as const;
    case 'in_production': return 'primary' as const;
    case 'shipped': return 'warning' as const;
    case 'delivered': return 'success' as const;
    case 'closed': return 'default' as const;
    case 'cancelled': return 'danger' as const;
    default: return 'default' as const;
  }
}

export default function SalesOrdersPage() {
  const { data: orders = [], isLoading } = useSalesOrders();
  const { data: customers = [] } = useCustomers();
  const { mutate: createOrder, isPending: isCreating } = useCreateSalesOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteSalesOrder();
  const { mutateAsync: importOrders } = useImportSalesOrders();
  const { isDemo } = useAppMode();

  // ── SlideOver state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // ── Form fields ──
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formOrderDate, setFormOrderDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formStatus, setFormStatus] = useState('draft');
  const [formNotes, setFormNotes] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formTotalAmount, setFormTotalAmount] = useState('');

  const resetForm = () => {
    setFormCustomerId('');
    setFormCustomerName('');
    setFormOrderDate(format(new Date(), 'yyyy-MM-dd'));
    setFormDeliveryDate('');
    setFormStatus('draft');
    setFormNotes('');
    setFormCurrency('USD');
    setFormTotalAmount('');
  };

  // ── Actions ──
  const handleCreate = () => {
    const payload: Record<string, unknown> = {
      orderDate: formOrderDate,
      customerId: formCustomerId || undefined,
      customerName: formCustomerName || undefined,
      requestedShipDate: formDeliveryDate || undefined,
      status: formStatus,
      notes: formNotes || undefined,
      currency: formCurrency,
      totalAmount: formTotalAmount ? parseFloat(formTotalAmount) : 0,
      subtotal: formTotalAmount ? parseFloat(formTotalAmount) : 0,
      lines: [],
    };

    createOrder(payload as any, {
      onSuccess: () => {
        setShowForm(false);
        resetForm();
      },
    });
  };

  const handleDelete = () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Delete sales order "${selectedOrder.soNumber}"? This cannot be undone.`)) return;
    deleteOrder(selectedOrder.id, {
      onSuccess: () => {
        setShowView(false);
        setSelectedOrder(null);
      },
    });
  };

  const handleRowClick = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowView(true);
  };

  // ── Table columns ──
  const columns: ColumnDef<SalesOrder>[] = useMemo(
    () => [
      {
        accessorKey: 'soNumber',
        header: 'SO #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.soNumber}</span>
        ),
      },
      {
        accessorKey: 'soDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.soDate), 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.customerName || '-'}</span>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {formatCurrency(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'requestedShipDate',
        header: 'Ship Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.requestedShipDate
              ? format(new Date(row.original.requestedShipDate), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={statusBadgeVariant(status)}>
              {status.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
    ],
    []
  );

  // ── Create form fields ──
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
        {customers.length > 0 ? (
          <select
            className={INPUT_CLS}
            value={formCustomerId}
            onChange={(e) => {
              const id = e.target.value;
              setFormCustomerId(id);
              const found = customers.find((c: any) => c.id === id);
              setFormCustomerName(found ? (found as any).customerName : '');
            }}
          >
            <option value="">Select a customer...</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.customerName}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={INPUT_CLS}
            placeholder="e.g. Acme Manufacturing"
            value={formCustomerName}
            onChange={(e) => setFormCustomerName(e.target.value)}
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Order Date</label>
        <input
          type="date"
          className={INPUT_CLS}
          value={formOrderDate}
          onChange={(e) => setFormOrderDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Delivery Date</label>
        <input
          type="date"
          className={INPUT_CLS}
          value={formDeliveryDate}
          onChange={(e) => setFormDeliveryDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          className={INPUT_CLS}
          value={formStatus}
          onChange={(e) => setFormStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
        <select
          className={INPUT_CLS}
          value={formCurrency}
          onChange={(e) => setFormCurrency(e.target.value)}
        >
          {CURRENCY_OPTIONS.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Total Amount</label>
        <input
          type="number"
          className={INPUT_CLS}
          placeholder="0.00"
          value={formTotalAmount}
          onChange={(e) => setFormTotalAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Additional notes or instructions..."
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
        />
      </div>
    </div>
  );

  // ── View detail (read-only) ──
  const renderViewDetails = () => {
    if (!selectedOrder) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">SO Number</label>
          <p className="text-sm text-text-primary">{selectedOrder.soNumber}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Customer</label>
          <p className="text-sm text-text-primary">{selectedOrder.customerName || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Order Date</label>
          <p className="text-sm text-text-primary">
            {format(new Date(selectedOrder.soDate), 'MMM dd, yyyy')}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Delivery / Ship Date</label>
          <p className="text-sm text-text-primary">
            {selectedOrder.requestedShipDate
              ? format(new Date(selectedOrder.requestedShipDate), 'MMM dd, yyyy')
              : '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Status</label>
          <Badge variant={statusBadgeVariant(selectedOrder.status)}>
            {selectedOrder.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Order Type</label>
          <p className="text-sm text-text-primary capitalize">
            {selectedOrder.orderType?.replace(/_/g, ' ') || '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Currency</label>
          <p className="text-sm text-text-primary">{selectedOrder.currency || 'USD'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Subtotal</label>
          <p className="text-sm text-text-primary">{formatCurrency(selectedOrder.subtotal)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Tax</label>
          <p className="text-sm text-text-primary">{formatCurrency(selectedOrder.taxAmount)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Shipping</label>
          <p className="text-sm text-text-primary">{formatCurrency(selectedOrder.shippingAmount)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Total Amount</label>
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(selectedOrder.totalAmount)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Payment Terms</label>
          <p className="text-sm text-text-primary">{selectedOrder.paymentTerms || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Customer PO #</label>
          <p className="text-sm text-text-primary">{selectedOrder.customerPONumber || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Notes</label>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedOrder.notes || '-'}</p>
        </div>
        {selectedOrder.lines && selectedOrder.lines.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Order Lines</label>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-1">
                  <tr>
                    <th className="text-left px-3 py-2 text-text-muted font-medium">#</th>
                    <th className="text-left px-3 py-2 text-text-muted font-medium">Description</th>
                    <th className="text-right px-3 py-2 text-text-muted font-medium">Qty</th>
                    <th className="text-right px-3 py-2 text-text-muted font-medium">Unit Price</th>
                    <th className="text-right px-3 py-2 text-text-muted font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.lines.map((line, idx) => (
                    <tr key={line.id || idx} className="border-t border-border">
                      <td className="px-3 py-2 text-text-secondary">{line.lineNumber}</td>
                      <td className="px-3 py-2 text-text-primary">{line.itemDescription}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{line.quantityOrdered}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatCurrency(line.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-text-primary font-medium">{formatCurrency(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton mt-4" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sales Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            View and manage all sales orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Order
          </Button>
        </div>
      </div>

      {/* GL Account Links */}
      <GLAccountStrip module="sales-orders" />

      {/* KPI Summary Cards */}
      {(() => {
        const totalOrders = orders.length;
        const openOrders = orders.filter((o: any) => !['closed', 'cancelled', 'delivered'].includes(o.status)).length;
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount ?? 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Orders</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalOrders.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Open Orders</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{openOrders.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Revenue</p>
                  <p className="text-lg font-bold text-brand-600 mt-2">{formatCurrency(totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Avg Order Value</p>
                  <p className="text-lg font-bold text-text-primary mt-2">{formatCurrency(avgOrderValue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Sales Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sales Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(orders, 'sales-orders')}
              onExportExcel={() => exportToExcel(orders, 'sales-orders')}
            />
          </div>
          <DataTable
            columns={columns}
            data={orders}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* New Order SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Sales Order"
        description="Create a new sales order"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* View Order SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => {
          setShowView(false);
          setSelectedOrder(null);
        }}
        title="Sales Order Details"
        description={selectedOrder?.soNumber ?? ''}
        width="md"
        footer={
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowView(false); setSelectedOrder(null); }}>
              Close
            </Button>
          </>
        }
      >
        {renderViewDetails()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={salesOrderImportSchema}
        onParseFile={parseFile}
        onAutoMap={autoMapColumns}
        onValidateRows={(rows, mappings, schema) => {
          const validData: Record<string, unknown>[] = [];
          const errors: any[] = [];
          rows.forEach((row, i) => {
            const mapped: Record<string, string> = {};
            mappings.forEach((m) => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map((e) => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          const result = await importOrders(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(salesOrderImportSchema)}
      />
    </div>
  );
}
