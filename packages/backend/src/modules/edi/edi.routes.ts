import { Router } from 'express';
import { eq, and, desc, sql, between, gte, lte } from 'drizzle-orm';
import { db } from '../../database/connection.js';
import {
  ediTradingPartners, ediTransactions, ediDocumentMaps, ediSettings,
  salesOrders, purchaseOrders, customers, vendors,
} from '../../database/schema.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { requireAuth, type AuthenticatedRequest } from '../../core/auth.js';
import {
  parseDocument, generateDocument,
  applyFieldMappings, reverseFieldMappings,
  process850, process810, process856,
  generate850, generate810, generate856, generate997,
} from './processors/index.js';
import { parseX12, extract850Data, extract810Data, extract856Data } from './x12/x12-parser.js';
import { buildX12Interchange } from './x12/x12-generator.js';
import { build850Segments, build810Segments, build856Segments, build997Segments } from './x12/x12-transaction-sets.js';
import { sendAs2Message } from './as2/as2-handler.js';
import { EdiSftpClient } from './sftp/sftp-client.js';
import { refreshSchedules } from './sftp/sftp-scheduler.js';
import type { EdiFieldMapping } from '@erp/shared';

export const ediRouter = Router();
ediRouter.use(requireAuth);

// ═══════════════════════════════════════════════
// ─── Overview / Dashboard KPIs ───
// ═══════════════════════════════════════════════

ediRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const tid = user!.tenantId;

    const [total] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(eq(ediTransactions.tenantId, tid));
    const [successful] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(and(eq(ediTransactions.tenantId, tid), eq(ediTransactions.status, 'completed')));
    const [failed] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(and(eq(ediTransactions.tenantId, tid), eq(ediTransactions.status, 'failed')));
    const [pending] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(and(eq(ediTransactions.tenantId, tid), eq(ediTransactions.status, 'pending')));
    const [partners] = await db.select({ count: sql<number>`count(*)` }).from(ediTradingPartners).where(and(eq(ediTradingPartners.tenantId, tid), eq(ediTradingPartners.isActive, true)));

    const today = new Date().toISOString().split('T')[0];
    const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(and(eq(ediTransactions.tenantId, tid), gte(ediTransactions.createdAt, new Date(today))));

    const totalNum = Number(total?.count || 0);
    const successNum = Number(successful?.count || 0);

    res.json({
      success: true,
      data: {
        totalTransactions: totalNum,
        successfulTransactions: successNum,
        failedTransactions: Number(failed?.count || 0),
        pendingTransactions: Number(pending?.count || 0),
        activeTradingPartners: Number(partners?.count || 0),
        transactionsToday: Number(todayCount?.count || 0),
        successRate: totalNum > 0 ? Math.round((successNum / totalNum) * 100 * 10) / 10 : 0,
      },
    });
  }),
);

// ═══════════════════════════════════════════════
// ─── Trading Partners ───
// ═══════════════════════════════════════════════

ediRouter.get(
  '/partners',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(ediTradingPartners)
      .where(eq(ediTradingPartners.tenantId, user!.tenantId))
      .orderBy(ediTradingPartners.partnerCode);
    res.json({ success: true, data: rows });
  }),
);

ediRouter.get(
  '/partners/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [partner] = await db
      .select()
      .from(ediTradingPartners)
      .where(and(eq(ediTradingPartners.id, req.params.id), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .limit(1);
    if (!partner) throw new AppError(404, 'Trading partner not found');
    res.json({ success: true, data: partner });
  }),
);

ediRouter.post(
  '/partners',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = req.body;

    const [partner] = await db.insert(ediTradingPartners).values({
      tenantId: user!.tenantId,
      partnerCode: body.partnerCode,
      partnerName: body.partnerName,
      partnerType: body.partnerType || 'customer',
      customerId: body.customerId || null,
      vendorId: body.vendorId || null,
      communicationMethod: body.communicationMethod || 'manual',
      defaultFormat: body.defaultFormat || 'csv',
      status: body.status || 'testing',
      isaId: body.isaId || null,
      gsId: body.gsId || null,
      as2Id: body.as2Id || null,
      as2Url: body.as2Url || null,
      partnerCertificate: body.partnerCertificate || null,
      encryptionAlgorithm: body.encryptionAlgorithm || 'aes256',
      signatureAlgorithm: body.signatureAlgorithm || 'sha256',
      sftpHost: body.sftpHost || null,
      sftpPort: body.sftpPort || 22,
      sftpUsername: body.sftpUsername || null,
      sftpPassword: body.sftpPassword || null,
      sftpRemoteDir: body.sftpRemoteDir || null,
      sftpPollSchedule: body.sftpPollSchedule || null,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      notes: body.notes || null,
    }).returning();

    // Refresh SFTP schedules if this is an SFTP partner
    if (body.communicationMethod === 'sftp') {
      refreshSchedules().catch(() => {});
    }

    res.status(201).json({ success: true, data: partner });
  }),
);

ediRouter.put(
  '/partners/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = req.body;

    const [updated] = await db
      .update(ediTradingPartners)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(ediTradingPartners.id, req.params.id), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Trading partner not found');

    // Refresh SFTP schedules on any partner update
    refreshSchedules().catch(() => {});

    res.json({ success: true, data: updated });
  }),
);

ediRouter.delete(
  '/partners/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [deleted] = await db
      .delete(ediTradingPartners)
      .where(and(eq(ediTradingPartners.id, req.params.id), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .returning();
    if (!deleted) throw new AppError(404, 'Trading partner not found');
    refreshSchedules().catch(() => {});
    res.json({ success: true, data: deleted });
  }),
);

// Test connection for SFTP/AS2 partner
ediRouter.post(
  '/partners/:id/test-connection',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [partner] = await db
      .select()
      .from(ediTradingPartners)
      .where(and(eq(ediTradingPartners.id, req.params.id), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .limit(1);

    if (!partner) throw new AppError(404, 'Partner not found');

    if (partner.communicationMethod === 'sftp') {
      const client = new EdiSftpClient();
      const result = await client.testConnection({
        host: partner.sftpHost || '',
        port: partner.sftpPort || 22,
        username: partner.sftpUsername || '',
        password: partner.sftpPassword || undefined,
      });
      res.json({ success: true, data: result });
    } else if (partner.communicationMethod === 'as2') {
      // AS2 test: attempt HTTP HEAD/OPTIONS to the URL
      try {
        const response = await fetch(partner.as2Url || '', { method: 'HEAD' });
        res.json({ success: true, data: { success: response.ok, status: response.status } });
      } catch (err) {
        res.json({ success: true, data: { success: false, error: (err as Error).message } });
      }
    } else {
      res.json({ success: true, data: { success: true, message: 'No connection test needed for manual partners' } });
    }
  }),
);

// ═══════════════════════════════════════════════
// ─── Transactions ───
// ═══════════════════════════════════════════════

ediRouter.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { status, docType, direction, partnerId, fromDate, toDate } = req.query;

    let query = db
      .select({
        id: ediTransactions.id,
        tenantId: ediTransactions.tenantId,
        transactionNumber: ediTransactions.transactionNumber,
        partnerId: ediTransactions.partnerId,
        partnerName: ediTradingPartners.partnerName,
        documentType: ediTransactions.documentType,
        direction: ediTransactions.direction,
        format: ediTransactions.format,
        status: ediTransactions.status,
        salesOrderId: ediTransactions.salesOrderId,
        purchaseOrderId: ediTransactions.purchaseOrderId,
        errorMessage: ediTransactions.errorMessage,
        as2MessageId: ediTransactions.as2MessageId,
        controlNumber: ediTransactions.controlNumber,
        documentDate: ediTransactions.documentDate,
        processedAt: ediTransactions.processedAt,
        createdAt: ediTransactions.createdAt,
        updatedAt: ediTransactions.updatedAt,
      })
      .from(ediTransactions)
      .leftJoin(ediTradingPartners, eq(ediTransactions.partnerId, ediTradingPartners.id))
      .where(eq(ediTransactions.tenantId, user!.tenantId))
      .orderBy(desc(ediTransactions.createdAt))
      .$dynamic();

    // Note: additional filters would be applied via Drizzle's .where() chaining
    // For simplicity, we filter in-memory for non-critical listing queries
    const rows = await query;

    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (docType) filtered = filtered.filter((r) => r.documentType === docType);
    if (direction) filtered = filtered.filter((r) => r.direction === direction);
    if (partnerId) filtered = filtered.filter((r) => r.partnerId === partnerId);

    res.json({ success: true, data: filtered });
  }),
);

ediRouter.get(
  '/transactions/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [txn] = await db
      .select()
      .from(ediTransactions)
      .where(and(eq(ediTransactions.id, req.params.id), eq(ediTransactions.tenantId, user!.tenantId)))
      .limit(1);

    if (!txn) throw new AppError(404, 'Transaction not found');

    // Join partner name
    const [partner] = await db
      .select({ partnerName: ediTradingPartners.partnerName })
      .from(ediTradingPartners)
      .where(eq(ediTradingPartners.id, txn.partnerId))
      .limit(1);

    res.json({ success: true, data: { ...txn, partnerName: partner?.partnerName || '' } });
  }),
);

// Process inbound document
ediRouter.post(
  '/transactions/inbound',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { partnerId, documentType, format, rawContent } = req.body;

    if (!partnerId || !documentType || !rawContent) {
      throw new AppError(400, 'partnerId, documentType, and rawContent are required');
    }

    // Verify partner
    const [partner] = await db
      .select()
      .from(ediTradingPartners)
      .where(and(eq(ediTradingPartners.id, partnerId), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .limit(1);
    if (!partner) throw new AppError(404, 'Trading partner not found');

    const docFormat = format || partner.defaultFormat || 'csv';

    // Generate transaction number
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ediTransactions)
      .where(eq(ediTransactions.tenantId, user!.tenantId));
    const txnNumber = `EDI-${String((Number(countResult?.count) || 0) + 1).padStart(5, '0')}`;

    // Create transaction record
    const [txn] = await db.insert(ediTransactions).values({
      tenantId: user!.tenantId,
      transactionNumber: txnNumber,
      partnerId,
      documentType,
      direction: 'inbound',
      format: docFormat,
      status: 'processing',
      rawContent,
      documentDate: new Date().toISOString().split('T')[0],
    }).returning();

    try {
      // Parse the document
      let parsedRows: Record<string, string>[];

      if (docFormat === 'x12') {
        const interchange = parseX12(rawContent);
        const txnSet = interchange.functionalGroups[0]?.transactionSets[0];
        if (!txnSet) throw new Error('No transaction set found in X12 document');

        switch (documentType) {
          case '850': parsedRows = extract850Data(txnSet); break;
          case '810': parsedRows = extract810Data(txnSet); break;
          case '856': parsedRows = extract856Data(txnSet); break;
          default: parsedRows = []; break;
        }
      } else {
        parsedRows = parseDocument(rawContent, docFormat);
      }

      // Apply field mappings if a map exists for this partner + doc type
      const [docMap] = await db
        .select()
        .from(ediDocumentMaps)
        .where(and(
          eq(ediDocumentMaps.tenantId, user!.tenantId),
          eq(ediDocumentMaps.documentType, documentType),
          eq(ediDocumentMaps.direction, 'inbound'),
          eq(ediDocumentMaps.isActive, true),
        ))
        .limit(1);

      let mappedRows = parsedRows as Record<string, unknown>[];
      if (docMap) {
        const rules: EdiFieldMapping[] = JSON.parse(docMap.mappingRules);
        mappedRows = applyFieldMappings(parsedRows, rules);
      }

      // Process into ERP records
      let processResult = { success: true, recordId: undefined as string | undefined, recordNumber: undefined as string | undefined, errors: undefined as string[] | undefined };
      switch (documentType) {
        case '850':
          processResult = await process850(mappedRows, user!.tenantId, user!.id);
          break;
        case '810':
          processResult = await process810(mappedRows, user!.tenantId, user!.id);
          break;
        case '856':
          processResult = await process856(mappedRows, user!.tenantId, user!.id);
          break;
      }

      // Update transaction
      await db.update(ediTransactions).set({
        status: processResult.success ? 'completed' : 'failed',
        parsedContent: JSON.stringify(mappedRows),
        salesOrderId: processResult.recordId && documentType === '850' ? processResult.recordId : null,
        purchaseOrderId: processResult.recordId && (documentType === '810' || documentType === '856') ? processResult.recordId : null,
        errorMessage: processResult.errors?.join('; ') || null,
        processedAt: new Date(),
        processedBy: user!.id,
        updatedAt: new Date(),
      }).where(eq(ediTransactions.id, txn.id));

      res.status(201).json({
        success: true,
        data: {
          transactionId: txn.id,
          transactionNumber: txnNumber,
          status: processResult.success ? 'completed' : 'failed',
          recordId: processResult.recordId,
          recordNumber: processResult.recordNumber,
          errors: processResult.errors,
        },
      });
    } catch (err) {
      await db.update(ediTransactions).set({
        status: 'failed',
        errorMessage: (err as Error).message,
        processedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(ediTransactions.id, txn.id));

      res.status(201).json({
        success: true,
        data: {
          transactionId: txn.id,
          transactionNumber: txnNumber,
          status: 'failed',
          errors: [(err as Error).message],
        },
      });
    }
  }),
);

// Generate outbound document
ediRouter.post(
  '/transactions/outbound',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const { partnerId, documentType, format, sourceRecordId, sendVia } = req.body;

    if (!partnerId || !documentType || !sourceRecordId) {
      throw new AppError(400, 'partnerId, documentType, and sourceRecordId are required');
    }

    const [partner] = await db
      .select()
      .from(ediTradingPartners)
      .where(and(eq(ediTradingPartners.id, partnerId), eq(ediTradingPartners.tenantId, user!.tenantId)))
      .limit(1);
    if (!partner) throw new AppError(404, 'Trading partner not found');

    const docFormat = format || partner.defaultFormat || 'csv';

    // Generate from ERP record
    let generatedData: { rows: Record<string, unknown>[]; metadata: { documentType: string; recordNumber: string; recordId: string } };

    switch (documentType) {
      case '850': generatedData = await generate850(sourceRecordId); break;
      case '810': generatedData = await generate810(sourceRecordId); break;
      case '856': generatedData = await generate856(sourceRecordId); break;
      default: throw new AppError(400, `Unsupported outbound document type: ${documentType}`);
    }

    // Apply field mappings if a map exists
    const [docMap] = await db
      .select()
      .from(ediDocumentMaps)
      .where(and(
        eq(ediDocumentMaps.tenantId, user!.tenantId),
        eq(ediDocumentMaps.documentType, documentType),
        eq(ediDocumentMaps.direction, 'outbound'),
        eq(ediDocumentMaps.isActive, true),
      ))
      .limit(1);

    let outputRows = generatedData.rows;
    if (docMap) {
      const rules: EdiFieldMapping[] = JSON.parse(docMap.mappingRules);
      outputRows = reverseFieldMappings(generatedData.rows, rules);
    }

    // Generate document content
    let rawContent: string;
    if (docFormat === 'x12') {
      // Build X12 content
      const settings = await getSettings(user!.tenantId);
      let segments: string[];
      switch (documentType) {
        case '850': {
          segments = build850Segments({
            poNumber: generatedData.metadata.recordNumber,
            poDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            lines: outputRows.map((r, i) => ({
              lineNumber: i + 1,
              quantity: Number(r.QuantityOrdered || r.quantityOrdered || 0),
              unitOfMeasure: String(r.UnitOfMeasure || r.unitOfMeasure || 'EA'),
              unitPrice: Number(r.UnitPrice || r.unitPrice || 0),
              itemNumber: String(r.ItemNumber || r.itemNumber || ''),
              description: String(r.ItemDescription || r.itemDescription || ''),
            })),
          });
          break;
        }
        case '810': {
          segments = build810Segments({
            invoiceNumber: generatedData.metadata.recordNumber,
            invoiceDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            poNumber: String(outputRows[0]?.PONumber || ''),
            lines: outputRows.map((r, i) => ({
              lineNumber: i + 1,
              quantity: Number(r.Quantity || r.quantity || 0),
              unitOfMeasure: String(r.UnitOfMeasure || 'EA'),
              unitPrice: Number(r.UnitPrice || r.unitPrice || 0),
              itemNumber: String(r.ItemNumber || r.itemNumber || ''),
            })),
            totalAmount: Number(outputRows[0]?.TotalAmount || 0),
          });
          break;
        }
        case '856': {
          segments = build856Segments({
            shipmentId: `SHP-${generatedData.metadata.recordNumber}`,
            shipDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            poNumber: String(outputRows[0]?.OrderNumber || ''),
            lines: outputRows.map((r, i) => ({
              lineNumber: i + 1,
              quantityShipped: Number(r.QuantityShipped || r.quantityShipped || 0),
              unitOfMeasure: String(r.UnitOfMeasure || 'EA'),
              itemNumber: String(r.ItemNumber || r.itemNumber || ''),
            })),
          });
          break;
        }
        default:
          segments = [];
      }

      rawContent = buildX12Interchange(documentType, segments, {
        senderId: settings?.companyIsaId || 'SENDER',
        receiverId: partner.isaId || 'RECEIVER',
      });
    } else {
      rawContent = generateDocument(outputRows, docFormat);
    }

    // Generate transaction number
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ediTransactions)
      .where(eq(ediTransactions.tenantId, user!.tenantId));
    const txnNumber = `EDI-${String((Number(countResult?.count) || 0) + 1).padStart(5, '0')}`;

    // Create transaction record
    const [txn] = await db.insert(ediTransactions).values({
      tenantId: user!.tenantId,
      transactionNumber: txnNumber,
      partnerId,
      documentType,
      direction: 'outbound',
      format: docFormat,
      status: 'completed',
      rawContent,
      parsedContent: JSON.stringify(outputRows),
      salesOrderId: documentType === '810' || documentType === '856' ? sourceRecordId : null,
      purchaseOrderId: documentType === '850' ? sourceRecordId : null,
      documentDate: new Date().toISOString().split('T')[0],
      processedAt: new Date(),
      processedBy: user!.id,
    }).returning();

    // Optionally send via AS2 or SFTP
    if (sendVia === 'as2' && partner.communicationMethod === 'as2' && partner.as2Url) {
      const settings = await getSettings(user!.tenantId);
      if (settings?.companyCertificate && settings?.companyPrivateKey) {
        const result = await sendAs2Message({
          as2From: settings.companyAs2Id || 'ERP',
          as2To: partner.as2Id || '',
          as2Url: partner.as2Url,
          content: rawContent,
          companyCertPem: settings.companyCertificate,
          companyKeyPem: settings.companyPrivateKey,
          partnerCertPem: partner.partnerCertificate || undefined,
        });

        await db.update(ediTransactions).set({
          as2MessageId: result.messageId,
          status: result.success ? 'completed' : 'failed',
          errorMessage: result.error || null,
          updatedAt: new Date(),
        }).where(eq(ediTransactions.id, txn.id));
      }
    } else if (sendVia === 'sftp' && partner.communicationMethod === 'sftp' && partner.sftpHost) {
      try {
        const client = new EdiSftpClient();
        await client.connect({
          host: partner.sftpHost,
          port: partner.sftpPort || 22,
          username: partner.sftpUsername || '',
          password: partner.sftpPassword || undefined,
        });
        const ext = docFormat === 'x12' ? 'edi' : docFormat;
        await client.uploadOutgoing(
          partner.sftpRemoteDir || '/outgoing',
          `${txnNumber}.${ext}`,
          rawContent
        );
        await client.disconnect();
      } catch (err) {
        await db.update(ediTransactions).set({
          errorMessage: `SFTP upload failed: ${(err as Error).message}`,
          updatedAt: new Date(),
        }).where(eq(ediTransactions.id, txn.id));
      }
    }

    res.status(201).json({ success: true, data: { ...txn, rawContent } });
  }),
);

// Generate 997 acknowledgment
ediRouter.post(
  '/transactions/:id/acknowledge',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [txn] = await db
      .select()
      .from(ediTransactions)
      .where(and(eq(ediTransactions.id, req.params.id), eq(ediTransactions.tenantId, user!.tenantId)))
      .limit(1);

    if (!txn) throw new AppError(404, 'Transaction not found');

    const ackRows = generate997(txn.transactionNumber, txn.documentType, true);
    const ackContent = generateDocument(ackRows, txn.format);

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(ediTransactions).where(eq(ediTransactions.tenantId, user!.tenantId));
    const ackNumber = `EDI-${String((Number(countResult?.count) || 0) + 1).padStart(5, '0')}`;

    const [ackTxn] = await db.insert(ediTransactions).values({
      tenantId: user!.tenantId,
      transactionNumber: ackNumber,
      partnerId: txn.partnerId,
      documentType: '997',
      direction: 'outbound',
      format: txn.format,
      status: 'completed',
      rawContent: ackContent,
      parsedContent: JSON.stringify(ackRows),
      acknowledgmentId: txn.id,
      processedAt: new Date(),
      processedBy: user!.id,
    }).returning();

    // Mark original as acknowledged
    await db.update(ediTransactions).set({
      status: 'acknowledged',
      acknowledgmentId: ackTxn.id,
      updatedAt: new Date(),
    }).where(eq(ediTransactions.id, txn.id));

    res.status(201).json({ success: true, data: ackTxn });
  }),
);

// Reprocess a failed transaction
ediRouter.post(
  '/transactions/:id/reprocess',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [txn] = await db
      .select()
      .from(ediTransactions)
      .where(and(eq(ediTransactions.id, req.params.id), eq(ediTransactions.tenantId, user!.tenantId)))
      .limit(1);

    if (!txn) throw new AppError(404, 'Transaction not found');
    if (!txn.rawContent) throw new AppError(400, 'No raw content to reprocess');

    // Reset to processing
    await db.update(ediTransactions).set({
      status: 'processing',
      errorMessage: null,
      updatedAt: new Date(),
    }).where(eq(ediTransactions.id, txn.id));

    // Re-trigger inbound processing by simulating the POST
    // This is a simplified approach - reuses the parsing logic
    try {
      let parsedRows: Record<string, string>[];
      if (txn.format === 'x12') {
        const interchange = parseX12(txn.rawContent);
        const txnSet = interchange.functionalGroups[0]?.transactionSets[0];
        if (!txnSet) throw new Error('No transaction set found');
        switch (txn.documentType) {
          case '850': parsedRows = extract850Data(txnSet); break;
          case '810': parsedRows = extract810Data(txnSet); break;
          case '856': parsedRows = extract856Data(txnSet); break;
          default: parsedRows = []; break;
        }
      } else {
        parsedRows = parseDocument(txn.rawContent, txn.format);
      }

      let result = { success: true, recordId: undefined as string | undefined, errors: undefined as string[] | undefined };
      switch (txn.documentType) {
        case '850': result = await process850(parsedRows, user!.tenantId, user!.id); break;
        case '810': result = await process810(parsedRows, user!.tenantId, user!.id); break;
        case '856': result = await process856(parsedRows, user!.tenantId, user!.id); break;
      }

      await db.update(ediTransactions).set({
        status: result.success ? 'completed' : 'failed',
        parsedContent: JSON.stringify(parsedRows),
        errorMessage: result.errors?.join('; ') || null,
        processedAt: new Date(),
        processedBy: user!.id,
        updatedAt: new Date(),
      }).where(eq(ediTransactions.id, txn.id));

      res.json({ success: true, data: { status: result.success ? 'completed' : 'failed' } });
    } catch (err) {
      await db.update(ediTransactions).set({
        status: 'failed',
        errorMessage: (err as Error).message,
        updatedAt: new Date(),
      }).where(eq(ediTransactions.id, txn.id));
      res.json({ success: true, data: { status: 'failed', error: (err as Error).message } });
    }
  }),
);

// ═══════════════════════════════════════════════
// ─── Document Maps ───
// ═══════════════════════════════════════════════

ediRouter.get(
  '/maps',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const rows = await db
      .select()
      .from(ediDocumentMaps)
      .where(eq(ediDocumentMaps.tenantId, user!.tenantId))
      .orderBy(ediDocumentMaps.mapName);

    // Parse mappingRules from JSON for response
    const parsed = rows.map((r) => ({
      ...r,
      mappingRules: JSON.parse(r.mappingRules),
    }));

    res.json({ success: true, data: parsed });
  }),
);

ediRouter.get(
  '/maps/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [docMap] = await db
      .select()
      .from(ediDocumentMaps)
      .where(and(eq(ediDocumentMaps.id, req.params.id), eq(ediDocumentMaps.tenantId, user!.tenantId)))
      .limit(1);
    if (!docMap) throw new AppError(404, 'Document map not found');
    res.json({ success: true, data: { ...docMap, mappingRules: JSON.parse(docMap.mappingRules) } });
  }),
);

ediRouter.post(
  '/maps',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = req.body;

    const [docMap] = await db.insert(ediDocumentMaps).values({
      tenantId: user!.tenantId,
      partnerId: body.partnerId || null,
      documentType: body.documentType,
      direction: body.direction,
      mapName: body.mapName,
      mappingRules: JSON.stringify(body.mappingRules || []),
      isDefault: body.isDefault || false,
      isActive: body.isActive !== false,
    }).returning();

    res.status(201).json({ success: true, data: { ...docMap, mappingRules: JSON.parse(docMap.mappingRules) } });
  }),
);

ediRouter.put(
  '/maps/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = req.body;
    const updates: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.mappingRules) updates.mappingRules = JSON.stringify(body.mappingRules);

    const [updated] = await db
      .update(ediDocumentMaps)
      .set(updates)
      .where(and(eq(ediDocumentMaps.id, req.params.id), eq(ediDocumentMaps.tenantId, user!.tenantId)))
      .returning();

    if (!updated) throw new AppError(404, 'Document map not found');
    res.json({ success: true, data: { ...updated, mappingRules: JSON.parse(updated.mappingRules) } });
  }),
);

ediRouter.delete(
  '/maps/:id',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [deleted] = await db
      .delete(ediDocumentMaps)
      .where(and(eq(ediDocumentMaps.id, req.params.id), eq(ediDocumentMaps.tenantId, user!.tenantId)))
      .returning();
    if (!deleted) throw new AppError(404, 'Document map not found');
    res.json({ success: true, data: deleted });
  }),
);

// ═══════════════════════════════════════════════
// ─── Settings ───
// ═══════════════════════════════════════════════

ediRouter.get(
  '/settings',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const [settings] = await db
      .select()
      .from(ediSettings)
      .where(eq(ediSettings.tenantId, user!.tenantId))
      .limit(1);

    if (!settings) {
      // Return defaults
      res.json({ success: true, data: {
        companyIsaId: null, companyGsId: null, companyAs2Id: null,
        companyCertificate: null, companyPrivateKey: null,
        autoAcknowledge997: true, autoCreateSalesOrders: false,
        autoGenerateOnApproval: false, defaultFormat: 'csv',
        retentionDays: 365, sftpPollingEnabled: false, sftpPollingIntervalMinutes: 15,
      }});
      return;
    }

    // Don't expose private key in full — mask it
    const masked = { ...settings };
    if (masked.companyPrivateKey) {
      masked.companyPrivateKey = '*** PRIVATE KEY SET ***';
    }

    res.json({ success: true, data: masked });
  }),
);

ediRouter.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const body = req.body;

    // Upsert: insert or update
    const [existing] = await db
      .select()
      .from(ediSettings)
      .where(eq(ediSettings.tenantId, user!.tenantId))
      .limit(1);

    let settings;
    if (existing) {
      const updates: Record<string, unknown> = { ...body, updatedAt: new Date() };
      // Don't overwrite private key if masked value is sent back
      if (updates.companyPrivateKey === '*** PRIVATE KEY SET ***') {
        delete updates.companyPrivateKey;
      }
      [settings] = await db
        .update(ediSettings)
        .set(updates)
        .where(eq(ediSettings.id, existing.id))
        .returning();
    } else {
      [settings] = await db
        .insert(ediSettings)
        .values({ tenantId: user!.tenantId, ...body })
        .returning();
    }

    // Refresh SFTP schedules if polling settings changed
    refreshSchedules().catch(() => {});

    res.json({ success: true, data: settings });
  }),
);

// Helper
async function getSettings(tenantId: string) {
  const [settings] = await db
    .select()
    .from(ediSettings)
    .where(eq(ediSettings.tenantId, tenantId))
    .limit(1);
  return settings;
}
