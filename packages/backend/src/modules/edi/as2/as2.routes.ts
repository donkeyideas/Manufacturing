import { Router, type Request, type Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../database/connection.js';
import { ediTradingPartners, ediTransactions, ediSettings } from '../../../database/schema.js';
import { receiveAs2Message } from './as2-handler.js';
import { asyncHandler } from '../../../core/asyncHandler.js';

export const as2Router = Router();

/**
 * POST /as2/receive
 * Public endpoint for receiving inbound AS2 messages from trading partners.
 * Authentication is via certificate verification, not JWT.
 */
as2Router.post('/receive', asyncHandler(async (req: Request, res: Response) => {
  const as2From = req.headers['as2-from'] as string || '';
  const as2To = req.headers['as2-to'] as string || '';
  const messageId = req.headers['message-id'] as string || '';

  if (!as2From || !as2To) {
    res.status(400).json({ success: false, error: 'Missing AS2-From or AS2-To headers' });
    return;
  }

  // Look up the partner by AS2 ID
  const [partner] = await db
    .select()
    .from(ediTradingPartners)
    .where(eq(ediTradingPartners.as2Id, as2From.replace(/"/g, '')))
    .limit(1);

  if (!partner) {
    res.status(404).json({ success: false, error: `Unknown AS2 sender: ${as2From}` });
    return;
  }

  // Load company settings for this tenant
  const [settings] = await db
    .select()
    .from(ediSettings)
    .where(eq(ediSettings.tenantId, partner.tenantId))
    .limit(1);

  // Process the AS2 message
  const rawBody = typeof req.body === 'string' ? req.body : req.body?.toString('base64') || '';
  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([k, v]) => [k, String(v)])
  );

  const result = receiveAs2Message(
    rawBody,
    headers,
    settings?.companyCertificate || undefined,
    settings?.companyPrivateKey || undefined,
    partner.partnerCertificate || undefined
  );

  // Generate transaction number
  const txnCount = await db
    .select()
    .from(ediTransactions)
    .where(eq(ediTransactions.tenantId, partner.tenantId));
  const txnNumber = `EDI-${String(txnCount.length + 1).padStart(5, '0')}`;

  // Log the transaction
  await db.insert(ediTransactions).values({
    tenantId: partner.tenantId,
    transactionNumber: txnNumber,
    partnerId: partner.id,
    documentType: '850', // Will be determined from content parsing
    direction: 'inbound',
    format: 'x12',
    status: result.success ? 'completed' : 'failed',
    rawContent: rawBody,
    parsedContent: result.success ? result.content : null,
    errorMessage: result.success ? null : 'AS2 processing failed',
    as2MessageId: messageId,
    processedAt: new Date(),
  });

  // Return MDN
  res.set('Content-Type', result.mdn.contentType);
  res.status(result.success ? 200 : 400).send(result.mdn.body);
}));

/**
 * POST /as2/mdn
 * Receive async MDN (Message Disposition Notification) from partner.
 */
as2Router.post('/mdn', asyncHandler(async (req: Request, res: Response) => {
  const body = typeof req.body === 'string' ? req.body : req.body?.toString() || '';

  // Extract original message ID from MDN
  const msgIdMatch = body.match(/Original-Message-ID:\s*(.+)/i);
  const originalMsgId = msgIdMatch ? msgIdMatch[1].trim() : '';

  if (originalMsgId) {
    // Update the original transaction status
    const [txn] = await db
      .select()
      .from(ediTransactions)
      .where(eq(ediTransactions.as2MessageId, originalMsgId))
      .limit(1);

    if (txn) {
      const isProcessed = body.toLowerCase().includes('processed');
      await db.update(ediTransactions)
        .set({
          status: isProcessed ? 'acknowledged' : 'failed',
          errorMessage: isProcessed ? null : 'Partner MDN indicates failure',
          updatedAt: new Date(),
        })
        .where(eq(ediTransactions.id, txn.id));
    }
  }

  res.status(200).send('MDN received');
}));
