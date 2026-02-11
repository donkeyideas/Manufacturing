import {
  loadCertificate, loadPrivateKey,
  signMessage, encryptMessage, decryptMessage, verifySignature,
  computeMic,
} from './certificate-manager.js';
import { generateMdn, parseMdn, type MdnData } from './mdn-handler.js';

export interface As2SendOptions {
  as2From: string;
  as2To: string;
  as2Url: string;
  content: string;
  contentType?: string;
  companyCertPem: string;
  companyKeyPem: string;
  partnerCertPem?: string;
  requestMdn?: boolean;
  mdnUrl?: string;
}

export interface As2SendResult {
  success: boolean;
  messageId: string;
  mdn?: MdnData;
  error?: string;
}

export interface As2ReceiveResult {
  success: boolean;
  content: string;
  as2From: string;
  as2To: string;
  messageId: string;
  mdn: { contentType: string; body: string };
}

/**
 * Send an AS2 message to a trading partner.
 */
export async function sendAs2Message(options: As2SendOptions): Promise<As2SendResult> {
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@erp-edi>`;

  try {
    let body = options.content;

    // Sign the message with our certificate
    const privateKey = loadPrivateKey(options.companyKeyPem);
    const certificate = loadCertificate(options.companyCertPem);
    body = signMessage(body, privateKey, certificate);

    // Encrypt with partner's certificate if available
    if (options.partnerCertPem) {
      const partnerCert = loadCertificate(options.partnerCertPem);
      body = encryptMessage(body, partnerCert);
    }

    // Compute MIC for MDN verification
    const mic = computeMic(options.content, 'sha256');

    // Build AS2 headers
    const headers: Record<string, string> = {
      'AS2-Version': '1.2',
      'AS2-From': options.as2From,
      'AS2-To': options.as2To,
      'Message-ID': messageId,
      'Content-Type': options.partnerCertPem
        ? 'application/pkcs7-mime; smime-type=enveloped-data'
        : 'application/pkcs7-mime; smime-type=signed-data',
      'Content-Transfer-Encoding': 'base64',
      'MIME-Version': '1.0',
    };

    if (options.requestMdn !== false) {
      headers['Disposition-Notification-To'] = options.mdnUrl || options.as2Url;
      headers['Disposition-Notification-Options'] =
        'signed-receipt-protocol=optional, pkcs7-signature; signed-receipt-micalg=optional, sha256';
    }

    // Send the HTTP POST
    const response = await fetch(options.as2Url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      return {
        success: false,
        messageId,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Parse sync MDN from response if present
    const responseBody = await response.text();
    let mdn: MdnData | undefined;
    if (responseBody && responseBody.includes('Disposition:')) {
      mdn = parseMdn(responseBody);
    }

    return { success: true, messageId, mdn };
  } catch (err) {
    return {
      success: false,
      messageId,
      error: (err as Error).message,
    };
  }
}

/**
 * Process an incoming AS2 message.
 * Returns the decrypted content and a prepared MDN response.
 */
export function receiveAs2Message(
  body: string,
  headers: Record<string, string>,
  companyCertPem?: string,
  companyKeyPem?: string,
  partnerCertPem?: string
): As2ReceiveResult {
  const as2From = headers['as2-from'] || headers['AS2-From'] || '';
  const as2To = headers['as2-to'] || headers['AS2-To'] || '';
  const messageId = headers['message-id'] || headers['Message-ID'] || '';
  const contentType = (headers['content-type'] || headers['Content-Type'] || '').toLowerCase();

  let content = body;

  try {
    // Decrypt if encrypted
    if (contentType.includes('enveloped') && companyKeyPem && companyCertPem) {
      const privateKey = loadPrivateKey(companyKeyPem);
      const certificate = loadCertificate(companyCertPem);
      content = decryptMessage(body, privateKey, certificate);
    }

    // Verify signature if signed
    if (contentType.includes('signed') && partnerCertPem) {
      const partnerCert = loadCertificate(partnerCertPem);
      const result = verifySignature(content, partnerCert);
      if (!result.valid) {
        // Generate failure MDN
        const mdn = generateMdn({
          originalMessageId: messageId,
          disposition: 'failed',
          errorMessage: 'Signature verification failed',
        });
        return { success: false, content: '', as2From, as2To, messageId, mdn };
      }
      content = result.content;
    }

    // Compute MIC for the MDN
    const mic = computeMic(content, 'sha256');

    // Generate success MDN
    const mdn = generateMdn({
      originalMessageId: messageId,
      disposition: 'processed',
      mic,
    });

    return { success: true, content, as2From, as2To, messageId, mdn };
  } catch (err) {
    const mdn = generateMdn({
      originalMessageId: messageId,
      disposition: 'failed',
      errorMessage: (err as Error).message,
    });
    return { success: false, content: '', as2From, as2To, messageId, mdn };
  }
}
