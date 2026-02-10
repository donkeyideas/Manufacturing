import { calculateKPI } from '../calculations/kpi';

// ─── AI Overview KPIs ───

export function getAIOverview() {
  const queriesThisMonth = calculateKPI(
    'Queries This Month',
    342,
    278,
    (v) => v.toString()
  );

  const documentsProcessed = calculateKPI(
    'Documents Processed',
    89,
    64,
    (v) => v.toString()
  );

  const insightsGenerated = calculateKPI(
    'Insights Generated',
    24,
    18,
    (v) => v.toString()
  );

  const avgResponseTime = calculateKPI(
    'Avg Response Time',
    1.2,
    1.8,
    (v) => `${v}s`,
    true
  );

  return {
    queriesThisMonth,
    documentsProcessed,
    insightsGenerated,
    avgResponseTime,
  };
}

// ─── Chat History ───

export function getChatHistory() {
  const now = new Date();

  return [
    {
      id: 'msg-001',
      role: 'user',
      content: "What's our current inventory level for steel plates?",
      timestamp: new Date(now.getTime() - 47 * 60000).toISOString(),
    },
    {
      id: 'msg-002',
      role: 'assistant',
      content: 'Current inventory for Steel Plates (SKU: RM-1042) is 2,450 units across 3 warehouses. Warehouse A holds 1,200 units, Warehouse B holds 850 units, and Warehouse C holds 400 units. Current stock is above the reorder point of 500 units. Based on the 30-day consumption rate of 82 units/day, you have approximately 30 days of supply remaining.',
      timestamp: new Date(now.getTime() - 46 * 60000).toISOString(),
    },
    {
      id: 'msg-003',
      role: 'user',
      content: 'Show me revenue trends for Q4',
      timestamp: new Date(now.getTime() - 38 * 60000).toISOString(),
    },
    {
      id: 'msg-004',
      role: 'assistant',
      content: 'Q4 2024 revenue shows a 12.5% increase over Q3, totaling $1,284,750. Monthly breakdown: October $398,200 (+8.2%), November $421,300 (+5.8%), December $465,250 (+10.4%). The strongest growth came from the Industrial Components product line, which saw a 22% increase driven by new contracts with Pacific Steel Works and Summit Industrial.',
      timestamp: new Date(now.getTime() - 37 * 60000).toISOString(),
    },
    {
      id: 'msg-005',
      role: 'user',
      content: 'Which work orders are behind schedule?',
      timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
    },
    {
      id: 'msg-006',
      role: 'assistant',
      content: 'There are 3 work orders currently behind schedule:\n\n1. WO-2024-089 — Custom Bracket Assembly (2 days late) — Delayed due to raw material shortage in aluminum sheets. Expected completion: Feb 12.\n2. WO-2024-094 — Precision Gear Set (1 day late) — CNC machine WC-03 experienced downtime. Expected completion: Feb 11.\n3. WO-2024-101 — Hydraulic Valve Housing (3 days late) — Quality inspection rework required. Expected completion: Feb 14.\n\nTotal impact: estimated $18,400 in delayed shipments.',
      timestamp: new Date(now.getTime() - 24 * 60000).toISOString(),
    },
    {
      id: 'msg-007',
      role: 'user',
      content: 'Predict reorder point for aluminum sheets',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: 'msg-008',
      role: 'assistant',
      content: 'Based on 90-day consumption analysis, I recommend a reorder point of 800 units for Aluminum Sheets (SKU: RM-2018). Current consumption averages 45 units/day with a standard deviation of 12 units. Lead time from primary vendor (Pacific Metal Supply) averages 7 business days. Safety stock calculation: 800 = (45 x 7) + (2.33 x 12 x sqrt(7)). Current stock is 1,120 units, giving you approximately 7 days before reaching the reorder point.',
      timestamp: new Date(now.getTime() - 14 * 60000).toISOString(),
    },
    {
      id: 'msg-009',
      role: 'user',
      content: 'What are our top 5 customers by revenue this quarter?',
      timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
    },
    {
      id: 'msg-010',
      role: 'assistant',
      content: 'Top 5 customers by revenue this quarter:\n\n1. Tech Assemblies Inc. — $134,200 (18 orders)\n2. Global Metal Solutions — $118,750 (12 orders)\n3. Pacific Steel Works — $97,400 (15 orders)\n4. Summit Industrial — $89,300 (9 orders)\n5. Acme Manufacturing — $78,650 (11 orders)\n\nTotal top-5 contribution: $518,300, representing 62% of quarterly revenue. Tech Assemblies has shown the highest growth at +34% quarter-over-quarter.',
      timestamp: new Date(now.getTime() - 7 * 60000).toISOString(),
    },
    {
      id: 'msg-011',
      role: 'user',
      content: 'How is production efficiency trending this week?',
      timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
    },
    {
      id: 'msg-012',
      role: 'assistant',
      content: 'Production efficiency (OEE) this week averages 87.3%, up from 84.1% last week. Daily breakdown: Monday 85.2%, Tuesday 88.1%, Wednesday 89.4%, Thursday 86.8%, Friday 87.0%. Work Center WC-01 leads at 92.1% OEE, while WC-03 lags at 78.5% due to the CNC downtime incident on Tuesday. Scrap rate is down to 2.8% from 3.4% last week. Recommendation: Schedule preventive maintenance for WC-03 this weekend to improve next week\'s output.',
      timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
    },
  ];
}

// ─── Document Queue ───

export function getDocumentQueue() {
  return [
    {
      id: 'doc-001',
      fileName: 'INV-2025-4521-PrecisionParts.pdf',
      fileType: 'invoice',
      uploadedAt: '2025-02-09T08:15:00Z',
      status: 'completed',
      extractedFields: 12,
      confidence: 96,
      uploadedBy: 'Maria Garcia',
    },
    {
      id: 'doc-002',
      fileName: 'PO-ACM-2503-SteelRods.pdf',
      fileType: 'purchase_order',
      uploadedAt: '2025-02-09T09:30:00Z',
      status: 'completed',
      extractedFields: 15,
      confidence: 94,
      uploadedBy: 'James Wilson',
    },
    {
      id: 'doc-003',
      fileName: 'REC-WH-A-20250209.pdf',
      fileType: 'receipt',
      uploadedAt: '2025-02-09T10:45:00Z',
      status: 'processing',
      extractedFields: 8,
      confidence: 78,
      uploadedBy: 'Sarah Chen',
    },
    {
      id: 'doc-004',
      fileName: 'SHIP-FedEx-9847362510.pdf',
      fileType: 'shipping_label',
      uploadedAt: '2025-02-09T11:20:00Z',
      status: 'completed',
      extractedFields: 9,
      confidence: 91,
      uploadedBy: 'Robert Kim',
    },
    {
      id: 'doc-005',
      fileName: 'INV-2025-4522-GlobalMetal.pdf',
      fileType: 'invoice',
      uploadedAt: '2025-02-09T13:00:00Z',
      status: 'pending',
      extractedFields: 0,
      confidence: 0,
      uploadedBy: 'Lisa Nguyen',
    },
    {
      id: 'doc-006',
      fileName: 'PO-PSW-8473-AluminumSheets.pdf',
      fileType: 'purchase_order',
      uploadedAt: '2025-02-09T14:10:00Z',
      status: 'failed',
      extractedFields: 3,
      confidence: 32,
      uploadedBy: 'Alex Thompson',
    },
  ];
}

// ─── AI Insights ───

export function getAIInsightsList() {
  return [
    {
      id: 'insight-001',
      category: 'anomaly',
      title: 'Unusual spike in raw material costs',
      description: 'Raw material costs are 23% above the 30-day average. Primary driver is steel plate pricing from Vendor V-201, which increased $0.45/lb since last week. This may impact margins on 8 active work orders.',
      severity: 'high',
      module: 'procurement',
      createdAt: '2025-02-09T07:30:00Z',
      isRead: false,
      actionUrl: '/procurement/orders',
    },
    {
      id: 'insight-002',
      category: 'prediction',
      title: 'Steel plate inventory projected to reach reorder point in 5 days',
      description: 'Based on current consumption rate of 82 units/day and pending work orders, Steel Plates (RM-1042) will reach the reorder point of 500 units by February 14. Recommend placing purchase order with Pacific Metal Supply within 2 days to maintain buffer stock.',
      severity: 'medium',
      module: 'inventory',
      createdAt: '2025-02-09T08:00:00Z',
      isRead: false,
      actionUrl: '/inventory/items',
    },
    {
      id: 'insight-003',
      category: 'recommendation',
      title: 'Consider consolidating shipments to Vendor V-103',
      description: 'Analysis of the last 90 days shows 14 separate shipments to Vendor V-103 (Pacific Steel Works). Consolidating into bi-weekly shipments could save an estimated 12% in freight costs, approximately $3,200/month.',
      severity: 'low',
      module: 'procurement',
      createdAt: '2025-02-09T08:15:00Z',
      isRead: true,
      actionUrl: '/procurement/vendors',
    },
    {
      id: 'insight-004',
      category: 'alert',
      title: 'Work Order WO-2024-092 at risk of missing deadline',
      description: 'WO-2024-092 (Hydraulic Valve Housing) is 3 days behind schedule due to quality inspection rework. Current completion rate suggests delivery will be delayed by 2 additional days unless overtime is authorized for Work Center WC-02.',
      severity: 'critical',
      module: 'manufacturing',
      createdAt: '2025-02-09T09:00:00Z',
      isRead: false,
      actionUrl: '/manufacturing/work-orders',
    },
    {
      id: 'insight-005',
      category: 'prediction',
      title: 'Q1 revenue projected to exceed forecast by 8%',
      description: 'Based on current order pipeline and historical conversion rates, Q1 2025 revenue is projected at $1,420,000, exceeding the $1,315,000 forecast. Key drivers: strong repeat orders from Tech Assemblies (+34% QoQ) and new contracts from Horizon Components.',
      severity: 'low',
      module: 'sales',
      createdAt: '2025-02-08T16:00:00Z',
      isRead: true,
      actionUrl: '/sales/overview',
    },
    {
      id: 'insight-006',
      category: 'anomaly',
      title: 'Scrap rate increase on Work Center WC-03',
      description: 'Work Center WC-03 is showing a 12% scrap rate this week, compared to the 3% historical average. Root cause analysis suggests CNC tool wear may be the primary factor. Last tool replacement was 45 days ago (recommended interval: 30 days).',
      severity: 'high',
      module: 'manufacturing',
      createdAt: '2025-02-08T14:30:00Z',
      isRead: false,
      actionUrl: '/manufacturing/work-orders',
    },
    {
      id: 'insight-007',
      category: 'recommendation',
      title: 'Optimize safety stock levels for slow-moving items',
      description: '12 items classified as C-category have safety stock levels exceeding 90 days of supply. Reducing safety stock to 45 days for these items would free up approximately $28,500 in working capital without significantly increasing stockout risk.',
      severity: 'medium',
      module: 'inventory',
      createdAt: '2025-02-08T11:00:00Z',
      isRead: true,
      actionUrl: '/inventory/items',
    },
    {
      id: 'insight-008',
      category: 'alert',
      title: 'Overdue invoices approaching 60-day threshold',
      description: '3 customer invoices totaling $32,915.60 are approaching the 60-day overdue mark: INV-2025-5005 (Coastal Fabrication, $10,638), INV-2025-5006 (Tech Assemblies, $16,632), and INV-2025-5010 (Cedar Creek Mfg, $5,745.60). Recommend escalating collection efforts.',
      severity: 'high',
      module: 'financial',
      createdAt: '2025-02-08T09:45:00Z',
      isRead: false,
      actionUrl: '/financial/overview',
    },
  ];
}
