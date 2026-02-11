import { computeMic } from './certificate-manager.js';

export interface MdnData {
  originalMessageId: string;
  disposition: 'processed' | 'failed';
  mic?: string;
  errorMessage?: string;
  reportingUA?: string;
}

/**
 * Generate an MDN (Message Disposition Notification) response body.
 * Returns a multipart/report MIME body.
 */
export function generateMdn(data: MdnData): { contentType: string; body: string } {
  const boundary = `----=_MDN_${Date.now()}`;
  const disposition = data.disposition === 'processed'
    ? 'automatic-action/MDN-sent-automatically; processed'
    : `automatic-action/MDN-sent-automatically; failed/Failure: ${data.errorMessage || 'processing-error'}`;

  const humanReadable = data.disposition === 'processed'
    ? 'The AS2 message was received and processed successfully.'
    : `The AS2 message could not be processed. Error: ${data.errorMessage || 'Unknown error'}`;

  const reportingUA = data.reportingUA || 'ERP-EDI-Module';

  const parts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=us-ascii',
    'Content-Transfer-Encoding: 7bit',
    '',
    humanReadable,
    '',
    `--${boundary}`,
    'Content-Type: message/disposition-notification',
    'Content-Transfer-Encoding: 7bit',
    '',
    `Reporting-UA: ${reportingUA}`,
    `Original-Message-ID: ${data.originalMessageId}`,
    `Disposition: ${disposition}`,
    ...(data.mic ? [`Received-Content-MIC: ${data.mic}, sha256`] : []),
    '',
    `--${boundary}--`,
  ];

  return {
    contentType: `multipart/report; report-type=disposition-notification; boundary="${boundary}"`,
    body: parts.join('\r\n'),
  };
}

/**
 * Parse an MDN response body to extract disposition info.
 */
export function parseMdn(body: string): MdnData {
  const result: MdnData = {
    originalMessageId: '',
    disposition: 'failed',
  };

  // Extract Original-Message-ID
  const msgIdMatch = body.match(/Original-Message-ID:\s*(.+)/i);
  if (msgIdMatch) {
    result.originalMessageId = msgIdMatch[1].trim();
  }

  // Extract Disposition
  const dispMatch = body.match(/Disposition:\s*(.+)/i);
  if (dispMatch) {
    const dispLine = dispMatch[1].trim().toLowerCase();
    result.disposition = dispLine.includes('processed') ? 'processed' : 'failed';
    if (dispLine.includes('failed') || dispLine.includes('error')) {
      const errorMatch = dispLine.match(/failure:\s*(.+)/i);
      result.errorMessage = errorMatch ? errorMatch[1].trim() : 'Unknown error';
    }
  }

  // Extract MIC
  const micMatch = body.match(/Received-Content-MIC:\s*([^,\r\n]+)/i);
  if (micMatch) {
    result.mic = micMatch[1].trim();
  }

  return result;
}

/**
 * Compute MIC for a message (re-exported for convenience).
 */
export function computeMessageMic(content: string): string {
  return computeMic(content, 'sha256');
}
