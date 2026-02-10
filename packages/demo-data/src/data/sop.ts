import type { SOP, SOPAcknowledgment } from '@erp/shared';
import { calculateKPI } from '../calculations/kpi';

const sops: SOP[] = [
  {
    id: 'sop-1',
    sopNumber: 'SOP-MFG-001',
    title: 'CNC Machine Operation Procedure',
    description: 'Standard procedure for operating CNC milling and turning machines, including setup, operation, and shutdown.',
    content: `<h2>1. Purpose</h2><p>This SOP establishes the standard procedure for safe and efficient operation of CNC milling and turning machines in the production facility.</p><h2>2. Required PPE</h2><ul><li>Safety glasses with side shields</li><li>Steel-toed boots</li><li>Hearing protection (above 85 dB)</li><li>No loose clothing, jewelry, or long sleeves</li></ul><h2>3. Pre-Operation Checks</h2><ol><li>Inspect the machine for any visible damage or leaks</li><li>Verify coolant levels are adequate</li><li>Check tool condition and ensure correct tooling is loaded</li><li>Verify the program number matches the work order</li><li>Confirm material stock is correct size and grade</li></ol><h2>4. Machine Setup</h2><ol><li>Power on the machine and allow it to complete its homing cycle</li><li>Load the correct G-code program from the work order</li><li>Set work offsets using the edge finder or probe</li><li>Verify tool offsets match the setup sheet</li><li>Run the program in single-block mode for the first piece</li></ol><h2>5. Operation</h2><ol><li>Start the program and monitor the first cycle closely</li><li>Check the first piece against the inspection drawing</li><li>If first piece passes inspection, continue production run</li><li>Monitor tool wear and replace tools per the tool life chart</li><li>Record production counts on the work order traveler</li></ol><h2>6. Shutdown</h2><ol><li>Complete the current cycle before stopping</li><li>Return all tools to the tool crib</li><li>Clean the machine and work area</li><li>Log production data in the ERP system</li></ol><h2>7. Safety Warnings</h2><p><strong>DANGER:</strong> Never reach into the machine envelope while spindle is rotating. Always use the E-stop if any unsafe condition is observed. Report all near-misses to your supervisor.</p>`,
    category: 'Machine Operation',
    department: 'Manufacturing',
    roles: ['CNC Operator', 'Machine Operator', 'Production Technician'],
    version: '2.1',
    status: 'published',
    effectiveDate: '2025-09-01',
    reviewDate: '2026-03-01',
    createdBy: 'Michael Torres',
    approvedBy: 'David Chen',
    tags: ['cnc', 'machining', 'safety', 'production'],
    revisionHistory: [
      { version: '1.0', changedBy: 'Michael Torres', changedAt: '2025-03-15T10:00:00Z', changeDescription: 'Initial version' },
      { version: '2.0', changedBy: 'Michael Torres', changedAt: '2025-07-20T14:00:00Z', changeDescription: 'Added probe setup procedure and updated PPE requirements' },
      { version: '2.1', changedBy: 'Sarah Chen', changedAt: '2025-09-01T09:00:00Z', changeDescription: 'Updated tool life chart references' },
    ],
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-09-01T09:00:00Z',
  },
  {
    id: 'sop-2',
    sopNumber: 'SOP-QC-001',
    title: 'Quality Inspection Procedure',
    description: 'Standard procedure for performing incoming, in-process, and final quality inspections.',
    content: `<h2>1. Purpose</h2><p>Establish consistent quality inspection procedures to ensure all products meet customer specifications and internal quality standards.</p><h2>2. Inspection Types</h2><h3>2.1 Incoming Inspection</h3><p>All received materials must be inspected per the incoming inspection plan before release to production.</p><h3>2.2 In-Process Inspection</h3><p>Operators perform self-inspections per the control plan. Quality technicians perform periodic audits.</p><h3>2.3 Final Inspection</h3><p>All completed products undergo final inspection before packaging and shipment.</p>`,
    category: 'Quality',
    department: 'Quality',
    roles: ['Quality Inspector', 'Quality Manager', 'Production Supervisor'],
    version: '1.3',
    status: 'published',
    effectiveDate: '2025-10-01',
    reviewDate: '2026-04-01',
    createdBy: 'Lisa Park',
    approvedBy: 'David Chen',
    tags: ['quality', 'inspection', 'qc'],
    revisionHistory: [
      { version: '1.0', changedBy: 'Lisa Park', changedAt: '2025-04-10T08:00:00Z', changeDescription: 'Initial version' },
      { version: '1.3', changedBy: 'Lisa Park', changedAt: '2025-10-01T11:00:00Z', changeDescription: 'Added statistical sampling tables' },
    ],
    createdAt: '2025-04-10T08:00:00Z',
    updatedAt: '2025-10-01T11:00:00Z',
  },
  {
    id: 'sop-3',
    sopNumber: 'SOP-SAF-001',
    title: 'Lockout/Tagout (LOTO) Procedure',
    description: 'Procedure for controlling hazardous energy during equipment maintenance and servicing.',
    content: `<h2>1. Purpose</h2><p>This procedure ensures the safety of all personnel during maintenance, repair, or servicing of equipment by controlling hazardous energy sources per OSHA 29 CFR 1910.147.</p><h2>2. Scope</h2><p>Applies to all maintenance activities on powered equipment, including electrical, hydraulic, pneumatic, chemical, thermal, and mechanical energy sources.</p>`,
    category: 'Safety',
    department: 'Manufacturing',
    roles: ['Maintenance Technician', 'Machine Operator', 'Production Supervisor', 'CNC Operator'],
    version: '3.0',
    status: 'published',
    effectiveDate: '2025-06-01',
    reviewDate: '2025-12-01',
    createdBy: 'James Wilson',
    approvedBy: 'David Chen',
    tags: ['safety', 'loto', 'osha', 'maintenance'],
    revisionHistory: [
      { version: '1.0', changedBy: 'James Wilson', changedAt: '2024-06-01T10:00:00Z', changeDescription: 'Initial version' },
      { version: '3.0', changedBy: 'James Wilson', changedAt: '2025-06-01T08:00:00Z', changeDescription: 'Major update per OSHA audit findings' },
    ],
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'sop-4',
    sopNumber: 'SOP-SAF-002',
    title: 'Chemical Handling and Storage',
    description: 'Safe handling, storage, and disposal of chemicals used in manufacturing processes.',
    content: `<h2>1. Purpose</h2><p>Ensure safe handling of all chemicals including coolants, solvents, adhesives, and cleaning agents used in manufacturing operations.</p>`,
    category: 'Safety',
    department: 'Manufacturing',
    roles: ['Machine Operator', 'CNC Operator', 'Maintenance Technician', 'Warehouse Associate'],
    version: '1.2',
    status: 'published',
    effectiveDate: '2025-08-15',
    createdBy: 'James Wilson',
    approvedBy: 'David Chen',
    tags: ['safety', 'chemicals', 'hazmat', 'sds'],
    revisionHistory: [
      { version: '1.0', changedBy: 'James Wilson', changedAt: '2025-02-01T10:00:00Z', changeDescription: 'Initial version' },
    ],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-08-15T09:00:00Z',
  },
  {
    id: 'sop-5',
    sopNumber: 'SOP-MFG-002',
    title: 'Assembly Line Start-Up Procedure',
    description: 'Standard procedure for starting and validating the assembly line at the beginning of each shift.',
    content: `<h2>1. Purpose</h2><p>Ensure consistent and safe assembly line start-up to minimize downtime and quality issues at the beginning of each production shift.</p>`,
    category: 'Machine Operation',
    department: 'Manufacturing',
    roles: ['Assembly Technician', 'Production Supervisor', 'Line Lead'],
    version: '1.0',
    status: 'published',
    effectiveDate: '2025-11-01',
    reviewDate: '2026-05-01',
    createdBy: 'Michael Torres',
    approvedBy: 'David Chen',
    tags: ['assembly', 'start-up', 'production'],
    revisionHistory: [
      { version: '1.0', changedBy: 'Michael Torres', changedAt: '2025-11-01T07:00:00Z', changeDescription: 'Initial version' },
    ],
    createdAt: '2025-11-01T07:00:00Z',
    updatedAt: '2025-11-01T07:00:00Z',
  },
  {
    id: 'sop-6',
    sopNumber: 'SOP-LOG-001',
    title: 'Forklift Operation Safety',
    description: 'Safe operation procedures for powered industrial trucks (forklifts) per OSHA requirements.',
    category: 'Safety',
    department: 'Warehouse',
    roles: ['Warehouse Associate', 'Shipping Clerk', 'Receiving Clerk'],
    version: '2.0',
    status: 'published',
    effectiveDate: '2025-07-01',
    createdBy: 'Angela Brooks',
    approvedBy: 'David Chen',
    tags: ['forklift', 'safety', 'warehouse', 'osha'],
    content: '<h2>1. Purpose</h2><p>Establish safe operating procedures for all forklift operations in the warehouse and production areas.</p>',
    revisionHistory: [
      { version: '1.0', changedBy: 'Angela Brooks', changedAt: '2025-01-15T10:00:00Z', changeDescription: 'Initial version' },
      { version: '2.0', changedBy: 'Angela Brooks', changedAt: '2025-07-01T08:00:00Z', changeDescription: 'Added electric forklift procedures' },
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-07-01T08:00:00Z',
  },
  {
    id: 'sop-7',
    sopNumber: 'SOP-QC-002',
    title: 'Packaging and Labeling Standards',
    description: 'Standards for product packaging, labeling, and shipment preparation.',
    category: 'Quality',
    department: 'Shipping',
    roles: ['Shipping Clerk', 'Quality Inspector', 'Warehouse Associate'],
    version: '1.1',
    status: 'published',
    effectiveDate: '2025-09-15',
    createdBy: 'Lisa Park',
    tags: ['packaging', 'labeling', 'shipping', 'quality'],
    content: '<h2>1. Purpose</h2><p>Ensure all outgoing products are properly packaged, labeled, and documented per customer requirements and shipping regulations.</p>',
    revisionHistory: [
      { version: '1.0', changedBy: 'Lisa Park', changedAt: '2025-05-01T10:00:00Z', changeDescription: 'Initial version' },
    ],
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-09-15T09:00:00Z',
  },
  {
    id: 'sop-8',
    sopNumber: 'SOP-MFG-003',
    title: 'Incoming Material Inspection',
    description: 'Procedure for inspecting and accepting incoming raw materials and components.',
    category: 'Quality',
    department: 'Quality',
    roles: ['Quality Inspector', 'Receiving Clerk'],
    version: '1.0',
    status: 'draft',
    effectiveDate: '2026-01-01',
    createdBy: 'Lisa Park',
    tags: ['incoming', 'inspection', 'receiving', 'quality'],
    content: '<h2>1. Purpose</h2><p>Define the process for inspecting incoming materials to ensure they meet purchase order specifications before acceptance into inventory.</p>',
    revisionHistory: [],
    createdAt: '2025-12-10T14:00:00Z',
    updatedAt: '2025-12-10T14:00:00Z',
  },
  {
    id: 'sop-9',
    sopNumber: 'SOP-SAF-003',
    title: 'Hazardous Waste Disposal',
    description: 'Proper disposal procedures for hazardous waste generated during manufacturing.',
    category: 'Safety',
    department: 'Manufacturing',
    roles: ['Maintenance Technician', 'Production Supervisor', 'Environmental Coordinator'],
    version: '1.0',
    status: 'under_review',
    effectiveDate: '2026-01-15',
    createdBy: 'James Wilson',
    tags: ['hazmat', 'waste', 'disposal', 'environmental'],
    content: '<h2>1. Purpose</h2><p>Establish procedures for the proper identification, storage, and disposal of hazardous waste in compliance with EPA and state regulations.</p>',
    revisionHistory: [],
    createdAt: '2025-12-05T10:00:00Z',
    updatedAt: '2025-12-12T16:00:00Z',
  },
];

const sopAcknowledgments: SOPAcknowledgment[] = [
  { id: 'ack-1', sopId: 'sop-1', sopTitle: 'CNC Machine Operation Procedure', employeeId: 'emp-1', employeeName: 'James Mitchell', acknowledgedAt: '2025-09-05T08:30:00Z', isAcknowledged: true, dueDate: '2025-09-15' },
  { id: 'ack-2', sopId: 'sop-2', sopTitle: 'Quality Inspection Procedure', employeeId: 'emp-1', employeeName: 'James Mitchell', acknowledgedAt: '2025-10-10T09:00:00Z', isAcknowledged: true, dueDate: '2025-10-15' },
  { id: 'ack-3', sopId: 'sop-3', sopTitle: 'Lockout/Tagout (LOTO) Procedure', employeeId: 'emp-1', employeeName: 'James Mitchell', acknowledgedAt: '2025-06-10T07:45:00Z', isAcknowledged: true, dueDate: '2025-06-15' },
  { id: 'ack-4', sopId: 'sop-4', sopTitle: 'Chemical Handling and Storage', employeeId: 'emp-1', employeeName: 'James Mitchell', isAcknowledged: false, dueDate: '2026-01-15' },
  { id: 'ack-5', sopId: 'sop-5', sopTitle: 'Assembly Line Start-Up Procedure', employeeId: 'emp-1', employeeName: 'James Mitchell', isAcknowledged: false, dueDate: '2026-01-20' },
  { id: 'ack-6', sopId: 'sop-1', sopTitle: 'CNC Machine Operation Procedure', employeeId: 'emp-2', employeeName: 'Sarah Johnson', acknowledgedAt: '2025-09-08T10:00:00Z', isAcknowledged: true, dueDate: '2025-09-15' },
  { id: 'ack-7', sopId: 'sop-3', sopTitle: 'Lockout/Tagout (LOTO) Procedure', employeeId: 'emp-2', employeeName: 'Sarah Johnson', isAcknowledged: false, dueDate: '2025-12-20' },
  { id: 'ack-8', sopId: 'sop-6', sopTitle: 'Forklift Operation Safety', employeeId: 'emp-3', employeeName: 'Robert Kim', acknowledgedAt: '2025-07-10T14:00:00Z', isAcknowledged: true, dueDate: '2025-07-15' },
];

export function getSOPs() {
  return sops;
}

export function getSOPById(id: string) {
  return sops.find((s) => s.id === id) || null;
}

export function getSOPAcknowledgments() {
  return sopAcknowledgments;
}

export function getSOPsByDepartment(dept: string) {
  return sops.filter((s) => s.department === dept);
}

export function getSOPsByRole(role: string) {
  return sops.filter((s) => s.roles.includes(role));
}

export function getSOPOverview() {
  const published = sops.filter((s) => s.status === 'published');
  const pendingAcks = sopAcknowledgments.filter((a) => !a.isAcknowledged);
  const overdueReviews = sops.filter((s) => s.reviewDate && new Date(s.reviewDate) < new Date());

  return {
    totalSOPs: calculateKPI('Total SOPs', sops.length, 7),
    publishedSOPs: calculateKPI('Published', published.length, 5),
    pendingAcknowledgments: calculateKPI('Pending Acks', pendingAcks.length, 4, (v) => v.toString(), true),
    overdueReviews: calculateKPI('Overdue Reviews', overdueReviews.length, 2, (v) => v.toString(), true),
  };
}
