import cron from 'node-cron';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../database/connection.js';
import { ediTradingPartners, ediTransactions, ediSettings } from '../../../database/schema.js';
import { EdiSftpClient, type SftpConfig } from './sftp-client.js';

interface ScheduledJob {
  partnerId: string;
  tenantId: string;
  task: cron.ScheduledTask;
}

const activeJobs: Map<string, ScheduledJob> = new Map();

/**
 * Initialize SFTP polling for all active SFTP partners.
 * Called on server startup.
 */
export async function initSftpScheduler(): Promise<void> {
  try {
    // Find all active partners with SFTP communication and a poll schedule
    const partners = await db
      .select()
      .from(ediTradingPartners)
      .where(
        and(
          eq(ediTradingPartners.communicationMethod, 'sftp'),
          eq(ediTradingPartners.isActive, true)
        )
      );

    for (const partner of partners) {
      if (partner.sftpHost && partner.sftpPollSchedule) {
        schedulePartnerPolling(partner);
      }
    }

    console.log(`[SFTP Scheduler] Initialized ${activeJobs.size} polling jobs`);
  } catch (err) {
    console.error('[SFTP Scheduler] Init error:', (err as Error).message);
  }
}

/**
 * Schedule SFTP polling for a single partner.
 */
function schedulePartnerPolling(partner: {
  id: string;
  tenantId: string;
  partnerName: string;
  sftpHost: string | null;
  sftpPort: number | null;
  sftpUsername: string | null;
  sftpPassword: string | null;
  sftpRemoteDir: string | null;
  sftpPollSchedule: string | null;
}): void {
  // Remove existing job if any
  const existing = activeJobs.get(partner.id);
  if (existing) {
    existing.task.stop();
    activeJobs.delete(partner.id);
  }

  const schedule = partner.sftpPollSchedule || '*/15 * * * *'; // Default: every 15 min
  if (!cron.validate(schedule)) {
    console.warn(`[SFTP] Invalid cron schedule for partner ${partner.partnerName}: ${schedule}`);
    return;
  }

  const task = cron.schedule(schedule, async () => {
    await pollPartner(partner);
  });

  activeJobs.set(partner.id, {
    partnerId: partner.id,
    tenantId: partner.tenantId,
    task,
  });

  console.log(`[SFTP] Scheduled polling for ${partner.partnerName} (${schedule})`);
}

/**
 * Poll a partner's SFTP server for new files.
 */
async function pollPartner(partner: {
  id: string;
  tenantId: string;
  partnerName: string;
  sftpHost: string | null;
  sftpPort: number | null;
  sftpUsername: string | null;
  sftpPassword: string | null;
  sftpRemoteDir: string | null;
}): Promise<void> {
  if (!partner.sftpHost || !partner.sftpUsername) return;

  const client = new EdiSftpClient();
  const config: SftpConfig = {
    host: partner.sftpHost,
    port: partner.sftpPort || 22,
    username: partner.sftpUsername,
    password: partner.sftpPassword || undefined,
  };

  try {
    await client.connect(config);
    const remoteDir = partner.sftpRemoteDir || '/incoming';
    const files = await client.pollIncoming(remoteDir);

    for (const file of files) {
      // Generate transaction number
      const txnCount = await db
        .select()
        .from(ediTransactions)
        .where(eq(ediTransactions.tenantId, partner.tenantId));
      const txnNumber = `EDI-${String(txnCount.length + 1).padStart(5, '0')}`;

      // Determine format from file extension
      const ext = file.filename.split('.').pop()?.toLowerCase() || '';
      const format = ext === 'xml' ? 'xml' : ext === 'json' ? 'json' : ext === 'edi' || ext === 'x12' ? 'x12' : 'csv';

      // Log the inbound transaction
      await db.insert(ediTransactions).values({
        tenantId: partner.tenantId,
        transactionNumber: txnNumber,
        partnerId: partner.id,
        documentType: '850', // Default — will be parsed from content
        direction: 'inbound',
        format: format as 'csv' | 'xml' | 'json' | 'x12',
        status: 'pending',
        rawContent: file.content,
      });

      // Move file to processed
      try {
        await client.markProcessed(remoteDir, file.filename);
      } catch {
        // Non-critical: file will be re-processed on next poll
      }

      console.log(`[SFTP] Received ${file.filename} from ${partner.partnerName}`);
    }

    await client.disconnect();
  } catch (err) {
    console.error(`[SFTP] Poll error for ${partner.partnerName}:`, (err as Error).message);
    try { await client.disconnect(); } catch { /* ignore */ }
  }
}

/**
 * Refresh polling schedules after partner configuration changes.
 */
export async function refreshSchedules(): Promise<void> {
  // Stop all existing jobs
  for (const [, job] of activeJobs) {
    job.task.stop();
  }
  activeJobs.clear();

  // Re-initialize
  await initSftpScheduler();
}

/**
 * Stop all scheduled polling jobs.
 */
export function stopAllSchedules(): void {
  for (const [, job] of activeJobs) {
    job.task.stop();
  }
  activeJobs.clear();
}
