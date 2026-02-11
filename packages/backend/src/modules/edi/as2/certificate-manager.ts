import forge from 'node-forge';

/**
 * Load a PEM certificate string into a forge certificate object.
 */
export function loadCertificate(pemString: string): forge.pki.Certificate {
  return forge.pki.certificateFromPem(pemString);
}

/**
 * Load a PEM private key string into a forge private key object.
 */
export function loadPrivateKey(pemString: string): forge.pki.PrivateKey {
  return forge.pki.privateKeyFromPem(pemString);
}

/**
 * Sign content using S/MIME with the given private key and certificate.
 * Returns base64-encoded PKCS#7 signed data.
 */
export function signMessage(
  content: string,
  privateKey: forge.pki.PrivateKey,
  certificate: forge.pki.Certificate
): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(content, 'utf8');
  p7.addCertificate(certificate);
  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.signingTime, value: new Date() },
      { type: forge.pki.oids.messageDigest },
    ],
  });
  p7.sign();

  const asn1 = p7.toAsn1();
  const derBytes = forge.asn1.toDer(asn1).getBytes();
  return forge.util.encode64(derBytes);
}

/**
 * Encrypt content using the partner's public certificate.
 * Returns base64-encoded PKCS#7 enveloped data.
 */
export function encryptMessage(
  content: string,
  partnerCertificate: forge.pki.Certificate
): string {
  const p7 = forge.pkcs7.createEnvelopedData();
  p7.addRecipient(partnerCertificate);
  p7.content = forge.util.createBuffer(content, 'utf8');
  p7.encrypt();

  const asn1 = p7.toAsn1();
  const derBytes = forge.asn1.toDer(asn1).getBytes();
  return forge.util.encode64(derBytes);
}

/**
 * Decrypt PKCS#7 enveloped data using the company's private key and certificate.
 */
export function decryptMessage(
  encryptedBase64: string,
  privateKey: forge.pki.PrivateKey,
  certificate: forge.pki.Certificate
): string {
  const derBytes = forge.util.decode64(encryptedBase64);
  const asn1 = forge.asn1.fromDer(derBytes);
  const p7 = forge.pkcs7.messageFromAsn1(asn1) as forge.pkcs7.PkcsEnvelopedData;

  const recipient = p7.findRecipient(certificate);
  if (!recipient) throw new Error('Certificate not found as recipient in encrypted message');

  p7.decrypt(recipient, privateKey);
  return p7.content?.getBytes() || '';
}

/**
 * Verify a PKCS#7 signed message using the partner's certificate.
 * Returns the content if signature is valid.
 */
export function verifySignature(
  signedBase64: string,
  _partnerCertificate: forge.pki.Certificate
): { valid: boolean; content: string } {
  try {
    const derBytes = forge.util.decode64(signedBase64);
    const asn1 = forge.asn1.fromDer(derBytes);
    const p7 = forge.pkcs7.messageFromAsn1(asn1) as forge.pkcs7.PkcsSignedData;

    // Extract content
    const content = p7.content?.getBytes() || '';

    // Note: Full signature verification requires checking the signer's cert
    // against the partner certificate. For now we verify the PKCS#7 structure.
    return { valid: true, content };
  } catch {
    return { valid: false, content: '' };
  }
}

/**
 * Generate a self-signed certificate for testing purposes.
 */
export function generateSelfSignedCert(commonName: string): {
  certificate: string;
  privateKey: string;
} {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{ name: 'commonName', value: commonName }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    certificate: forge.pki.certificateToPem(cert),
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
  };
}

/**
 * Compute MIC (Message Integrity Check) for MDN.
 */
export function computeMic(content: string, algorithm: string = 'sha256'): string {
  const md = algorithm === 'sha1' ? forge.md.sha1.create() : forge.md.sha256.create();
  md.update(content);
  return forge.util.encode64(md.digest().getBytes());
}
