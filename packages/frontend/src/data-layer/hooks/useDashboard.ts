import { useQuery } from '@tanstack/react-query';
import { useAppMode, useIndustry } from '../providers/AppModeProvider';
import { apiClient } from '../api/client';
import { getIndustryDashboardSummary } from '@erp/demo-data';
import { formatCurrency, formatCompact } from '@erp/shared';

/** Map backend flat numbers to industry-profile KPI keys with formatted values */
function mapBackendToKPIs(raw: Record<string, any>) {
  const num = (v: unknown) => Number(v ?? 0);
  const totalRev = num(raw.totalRevenue);
  const activeWOs = num(raw.activeWorkOrders);
  const totalWOs = activeWOs + num(raw.completedWorkOrders ?? 0);
  const oee = totalWOs > 0 ? Math.round((num(raw.completedWorkOrders ?? 0) / totalWOs) * 100) : 0;

  return {
    // Keep original keys so any direct lookup still works
    ...raw,
    // General manufacturing KPIs
    revenue: { label: 'Revenue', formattedValue: `$${formatCompact(totalRev)}` },
    activeOrders: { label: 'Active Orders', formattedValue: num(raw.openSalesOrders).toLocaleString() },
    inventoryAlerts: { label: 'Inventory Items', formattedValue: num(raw.totalItems).toLocaleString() },
    oee: { label: 'OEE', formattedValue: `${oee}%` },
    // Additional industry KPIs — provide reasonable fallbacks
    onTimeDelivery: { label: 'On-Time Delivery', formattedValue: 'N/A' },
    ppmDefectRate: { label: 'PPM Defect Rate', formattedValue: 'N/A' },
    taktTime: { label: 'Takt Time', formattedValue: 'N/A' },
    firstPassYield: { label: 'First Pass Yield', formattedValue: 'N/A' },
    smtDefectRate: { label: 'SMT Defect Rate', formattedValue: 'N/A' },
    throughput: { label: 'Throughput', formattedValue: 'N/A' },
    componentLeadTime: { label: 'Component Lead Time', formattedValue: 'N/A' },
    batchYield: { label: 'Batch Yield', formattedValue: 'N/A' },
    gmpCompliance: { label: 'GMP Compliance', formattedValue: 'N/A' },
    safetyIncidents: { label: 'Safety Incidents', formattedValue: 'N/A' },
    as9100Compliance: { label: 'AS9100 Compliance', formattedValue: 'N/A' },
    ncRate: { label: 'NC Rate', formattedValue: 'N/A' },
    cuttingEfficiency: { label: 'Cutting Efficiency', formattedValue: 'N/A' },
    fabricYield: { label: 'Fabric Yield', formattedValue: 'N/A' },
    samplesInProgress: { label: 'Samples In Progress', formattedValue: 'N/A' },
    batchTracking: { label: 'Batch Tracking', formattedValue: 'N/A' },
    haccpCompliance: { label: 'HACCP Compliance', formattedValue: 'N/A' },
    materialUtilization: { label: 'Material Utilization', formattedValue: 'N/A' },
    jobCompletion: { label: 'Job Completion', formattedValue: 'N/A' },
    estimateAccuracy: { label: 'Estimate Accuracy', formattedValue: 'N/A' },
  };
}

export function useDashboardSummary() {
  const { isDemo } = useAppMode();
  const { industryType } = useIndustry();

  return useQuery({
    queryKey: ['dashboard', 'overview', industryType],
    queryFn: async () => {
      if (isDemo) return getIndustryDashboardSummary(industryType);
      const { data } = await apiClient.get('/dashboard/overview');
      return mapBackendToKPIs(data.data);
    },
  });
}
