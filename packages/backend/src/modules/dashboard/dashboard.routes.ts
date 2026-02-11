import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import {
  items,
  inventoryOnHand,
  customers,
  salesOrders,
  vendors,
  purchaseOrders,
  workOrders,
} from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

// ─── GET /api/dashboard/overview ───
// Aggregates KPIs across all modules for the main dashboard

dashboardRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const tenantId = user!.tenantId;

    // Run all queries in parallel
    const [
      itemCountResult,
      customerCountResult,
      vendorCountResult,
      openSalesOrdersResult,
      openPOsResult,
      activeWOsResult,
      inventoryValueResult,
      salesRevenueResult,
    ] = await Promise.all([
      // Total active items
      db.select({ count: sql<number>`count(*)` })
        .from(items)
        .where(and(eq(items.tenantId, tenantId), eq(items.isActive, true))),

      // Total customers
      db.select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(eq(customers.tenantId, tenantId)),

      // Total vendors
      db.select({ count: sql<number>`count(*)` })
        .from(vendors)
        .where(eq(vendors.tenantId, tenantId)),

      // Open sales orders
      db.select({ count: sql<number>`count(*)` })
        .from(salesOrders)
        .where(and(
          eq(salesOrders.tenantId, tenantId),
          sql`${salesOrders.status} NOT IN ('closed', 'cancelled', 'delivered')`,
        )),

      // Open purchase orders
      db.select({ count: sql<number>`count(*)` })
        .from(purchaseOrders)
        .where(and(
          eq(purchaseOrders.tenantId, tenantId),
          sql`${purchaseOrders.status} NOT IN ('closed', 'cancelled', 'received')`,
        )),

      // Active work orders
      db.select({ count: sql<number>`count(*)` })
        .from(workOrders)
        .where(and(
          eq(workOrders.tenantId, tenantId),
          sql`${workOrders.status} IN ('planned', 'released', 'in_progress')`,
        )),

      // Total inventory value
      db.select({ total: sql<number>`coalesce(sum(cast(${inventoryOnHand.quantityOnHand} as numeric) * cast(${items.unitCost} as numeric)), 0)` })
        .from(inventoryOnHand)
        .innerJoin(items, eq(inventoryOnHand.itemId, items.id))
        .where(eq(inventoryOnHand.tenantId, tenantId)),

      // Total sales revenue (sum of all sales orders)
      db.select({ total: sql<number>`coalesce(sum(cast(${salesOrders.totalAmount} as numeric)), 0)` })
        .from(salesOrders)
        .where(eq(salesOrders.tenantId, tenantId)),
    ]);

    res.json({
      success: true,
      data: {
        totalItems: Number(itemCountResult[0].count),
        totalCustomers: Number(customerCountResult[0].count),
        totalVendors: Number(vendorCountResult[0].count),
        openSalesOrders: Number(openSalesOrdersResult[0].count),
        openPurchaseOrders: Number(openPOsResult[0].count),
        activeWorkOrders: Number(activeWOsResult[0].count),
        inventoryValue: Number(inventoryValueResult[0].total),
        totalRevenue: Number(salesRevenueResult[0].total),
      },
    });
  }),
);
