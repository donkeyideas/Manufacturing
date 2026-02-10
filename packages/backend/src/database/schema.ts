import { pgTable, uuid, varchar, text, boolean, timestamp, integer, numeric, date, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ───

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'manager', 'user', 'viewer']);
export const poStatusEnum = pgEnum('po_status', ['draft', 'pending_approval', 'approved', 'sent', 'partially_received', 'received', 'closed', 'cancelled']);
export const soStatusEnum = pgEnum('so_status', ['draft', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'invoiced', 'closed', 'cancelled']);
export const woStatusEnum = pgEnum('wo_status', ['planned', 'released', 'in_progress', 'completed', 'closed', 'cancelled']);
export const journalStatusEnum = pgEnum('journal_status', ['draft', 'posted', 'reversed']);
export const reqStatusEnum = pgEnum('req_status', ['draft', 'submitted', 'approved', 'rejected', 'converted', 'cancelled']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'pending_approval', 'approved', 'paid', 'partially_paid', 'cancelled']);
export const receiptStatusEnum = pgEnum('receipt_status', ['pending', 'inspected', 'accepted', 'rejected', 'partial']);
export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'archived']);
export const sopStatusEnum = pgEnum('sop_status', ['draft', 'active', 'under_review', 'archived']);
export const hazardLevelEnum = pgEnum('hazard_level', ['none', 'low', 'medium', 'high', 'critical']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected', 'cancelled']);
export const shiftTypeEnum = pgEnum('shift_type', ['morning', 'afternoon', 'night', 'flexible']);
export const certStatusEnum = pgEnum('cert_status', ['active', 'expired', 'pending_renewal']);
export const reviewStatusEnum = pgEnum('review_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);

// ─── Tenants ───

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  plan: varchar('plan', { length: 50 }).default('trial'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Users ───

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Demo Access Codes ───

export const demoAccessCodes = pgTable('demo_access_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  modulesEnabled: text('modules_enabled'), // JSON array of module IDs
  template: varchar('template', { length: 50 }).default('manufacturing'),
  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),
  maxUsages: integer('max_usages').default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Financial: Chart of Accounts ───

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(), // asset, liability, equity, revenue, expense
  parentAccountId: uuid('parent_account_id'),
  isActive: boolean('is_active').default(true),
  balance: numeric('balance', { precision: 18, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Financial: Journal Entries ───

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  entryNumber: varchar('entry_number', { length: 30 }).notNull(),
  entryDate: date('entry_date').notNull(),
  description: text('description'),
  status: journalStatusEnum('status').default('draft').notNull(),
  totalDebit: numeric('total_debit', { precision: 18, scale: 2 }).default('0'),
  totalCredit: numeric('total_credit', { precision: 18, scale: 2 }).default('0'),
  createdBy: uuid('created_by').references(() => users.id),
  postedAt: timestamp('posted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  accountId: uuid('account_id').references(() => accounts.id).notNull(),
  description: text('description'),
  debitAmount: numeric('debit_amount', { precision: 18, scale: 2 }).default('0'),
  creditAmount: numeric('credit_amount', { precision: 18, scale: 2 }).default('0'),
  lineNumber: integer('line_number').notNull(),
});

// ─── Inventory: Items ───

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  itemNumber: varchar('item_number', { length: 30 }).notNull(),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  itemType: varchar('item_type', { length: 30 }).notNull(), // raw_material, finished_good, component, service
  unitOfMeasure: varchar('unit_of_measure', { length: 20 }).default('EA'),
  unitCost: numeric('unit_cost', { precision: 18, scale: 4 }).default('0'),
  sellingPrice: numeric('selling_price', { precision: 18, scale: 4 }).default('0'),
  reorderPoint: integer('reorder_point').default(0),
  reorderQuantity: integer('reorder_quantity').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Inventory: Warehouses ───

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  warehouseCode: varchar('warehouse_code', { length: 20 }).notNull(),
  warehouseName: varchar('warehouse_name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Inventory: On-Hand ───

export const inventoryOnHand = pgTable('inventory_on_hand', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  quantityOnHand: numeric('quantity_on_hand', { precision: 18, scale: 4 }).default('0'),
  quantityReserved: numeric('quantity_reserved', { precision: 18, scale: 4 }).default('0'),
  quantityAvailable: numeric('quantity_available', { precision: 18, scale: 4 }).default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sales: Customers ───

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  customerNumber: varchar('customer_number', { length: 30 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 30 }),
  paymentTerms: varchar('payment_terms', { length: 50 }),
  creditLimit: numeric('credit_limit', { precision: 18, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sales: Orders ───

export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  orderNumber: varchar('order_number', { length: 30 }).notNull(),
  orderDate: date('order_date').notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  status: soStatusEnum('status').default('draft').notNull(),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 18, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  deliveryDate: date('delivery_date'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const salesOrderLines = pgTable('sales_order_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  salesOrderId: uuid('sales_order_id').references(() => salesOrders.id).notNull(),
  itemId: uuid('item_id').references(() => items.id),
  lineNumber: integer('line_number').notNull(),
  itemDescription: text('item_description').notNull(),
  quantityOrdered: numeric('quantity_ordered', { precision: 18, scale: 4 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 18, scale: 4 }).notNull(),
  lineTotal: numeric('line_total', { precision: 18, scale: 2 }).notNull(),
});

// ─── Procurement: Vendors ───

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  vendorNumber: varchar('vendor_number', { length: 30 }).notNull(),
  vendorName: varchar('vendor_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 30 }),
  paymentTerms: varchar('payment_terms', { length: 50 }),
  creditLimit: numeric('credit_limit', { precision: 18, scale: 2 }),
  isActive: boolean('is_active').default(true),
  is1099Eligible: boolean('is_1099_eligible').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Procurement: Purchase Orders ───

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  poNumber: varchar('po_number', { length: 30 }).notNull(),
  poDate: date('po_date').notNull(),
  vendorId: uuid('vendor_id').references(() => vendors.id).notNull(),
  status: poStatusEnum('status').default('draft').notNull(),
  subtotal: numeric('subtotal', { precision: 18, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 18, scale: 2 }).default('0'),
  shippingAmount: numeric('shipping_amount', { precision: 18, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 18, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  deliveryDate: date('delivery_date'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const purchaseOrderLines = pgTable('purchase_order_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  poId: uuid('po_id').references(() => purchaseOrders.id).notNull(),
  itemId: uuid('item_id').references(() => items.id),
  lineNumber: integer('line_number').notNull(),
  itemDescription: text('item_description').notNull(),
  quantityOrdered: numeric('quantity_ordered', { precision: 18, scale: 4 }).notNull(),
  quantityReceived: numeric('quantity_received', { precision: 18, scale: 4 }).default('0'),
  unitPrice: numeric('unit_price', { precision: 18, scale: 4 }).notNull(),
  lineTotal: numeric('line_total', { precision: 18, scale: 2 }).notNull(),
});

// ─── Manufacturing: BOMs ───

export const billOfMaterials = pgTable('bill_of_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  bomNumber: varchar('bom_number', { length: 30 }).notNull(),
  bomName: varchar('bom_name', { length: 255 }).notNull(),
  finishedItemId: uuid('finished_item_id').references(() => items.id).notNull(),
  revision: varchar('revision', { length: 10 }).default('A'),
  isActive: boolean('is_active').default(true),
  outputQuantity: numeric('output_quantity', { precision: 18, scale: 4 }).default('1'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bomComponents = pgTable('bom_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  bomId: uuid('bom_id').references(() => billOfMaterials.id).notNull(),
  componentItemId: uuid('component_item_id').references(() => items.id).notNull(),
  quantityRequired: numeric('quantity_required', { precision: 18, scale: 4 }).notNull(),
  unitOfMeasure: varchar('unit_of_measure', { length: 20 }).default('EA'),
  wastePercent: numeric('waste_percent', { precision: 5, scale: 2 }).default('0'),
  lineNumber: integer('line_number').notNull(),
});

// ─── Manufacturing: Work Orders ───

export const workOrders = pgTable('work_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  woNumber: varchar('wo_number', { length: 30 }).notNull(),
  bomId: uuid('bom_id').references(() => billOfMaterials.id),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  status: woStatusEnum('status').default('planned').notNull(),
  quantityOrdered: numeric('quantity_ordered', { precision: 18, scale: 4 }).notNull(),
  quantityCompleted: numeric('quantity_completed', { precision: 18, scale: 4 }).default('0'),
  plannedStartDate: date('planned_start_date'),
  plannedEndDate: date('planned_end_date'),
  actualStartDate: date('actual_start_date'),
  actualEndDate: date('actual_end_date'),
  priority: varchar('priority', { length: 20 }).default('normal'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Blog: Posts ───

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  status: blogPostStatusEnum('status').default('draft').notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  featuredImageUrl: text('featured_image_url'),
  tags: text('tags'), // JSON array of tag strings
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  targetKeyword: varchar('target_keyword', { length: 255 }),
  wordCount: integer('word_count').default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── SOPs: Standard Operating Procedures ───

export const sops = pgTable('sops', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  sopNumber: varchar('sop_number', { length: 30 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  hazardLevel: hazardLevelEnum('hazard_level').default('none').notNull(),
  status: sopStatusEnum('status').default('draft').notNull(),
  content: text('content').notNull(),
  equipmentInvolved: text('equipment_involved'), // JSON array
  currentRevision: integer('current_revision').default(1),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sopRevisions = pgTable('sop_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sopId: uuid('sop_id').references(() => sops.id).notNull(),
  revisionNumber: integer('revision_number').notNull(),
  content: text('content').notNull(),
  changeDescription: text('change_description'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sopAcknowledgments = pgTable('sop_acknowledgments', {
  id: uuid('id').primaryKey().defaultRandom(),
  sopId: uuid('sop_id').references(() => sops.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  revisionNumber: integer('revision_number').notNull(),
  acknowledgedAt: timestamp('acknowledged_at').defaultNow().notNull(),
  notes: text('notes'),
});

// ─── Portal: Shift Schedules ───

export const shiftSchedules = pgTable('shift_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  shiftType: shiftTypeEnum('shift_type').default('morning').notNull(),
  shiftDate: date('shift_date').notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 10 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Portal: Company Announcements ───

export const companyAnnouncements = pgTable('company_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  isActive: boolean('is_active').default(true),
  publishedBy: uuid('published_by').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Portal: Training & Certifications ───

export const trainingCertifications = pgTable('training_certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  certificationName: varchar('certification_name', { length: 255 }).notNull(),
  issuingAuthority: varchar('issuing_authority', { length: 255 }),
  certificationNumber: varchar('certification_number', { length: 100 }),
  status: certStatusEnum('status').default('active').notNull(),
  issuedDate: date('issued_date').notNull(),
  expiryDate: date('expiry_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Portal: Employee Reviews ───

export const employeeReviews = pgTable('employee_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  employeeId: uuid('employee_id').references(() => users.id).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
  reviewPeriod: varchar('review_period', { length: 50 }).notNull(), // e.g. "Q1 2026", "Annual 2025"
  status: reviewStatusEnum('status').default('scheduled').notNull(),
  overallRating: integer('overall_rating'), // 1-5
  strengths: text('strengths'),
  areasForImprovement: text('areas_for_improvement'),
  goals: text('goals'), // JSON array
  employeeComments: text('employee_comments'),
  scheduledDate: date('scheduled_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
