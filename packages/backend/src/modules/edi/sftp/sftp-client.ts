import SftpClient from 'ssh2-sftp-client';

export interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export interface PolledFile {
  filename: string;
  content: string;
  modifiedAt: Date;
}

/**
 * SFTP client wrapper for EDI file operations.
 */
export class EdiSftpClient {
  private sftp: SftpClient;
  private connected = false;

  constructor() {
    this.sftp = new SftpClient();
  }

  /**
   * Connect to SFTP server.
   */
  async connect(config: SftpConfig): Promise<void> {
    await this.sftp.connect({
      host: config.host,
      port: config.port || 22,
      username: config.username,
      password: config.password,
      ...(config.privateKey ? { privateKey: config.privateKey } : {}),
    });
    this.connected = true;
  }

  /**
   * Poll incoming directory for new EDI files.
   * Returns file contents for processing.
   */
  async pollIncoming(remoteDir: string): Promise<PolledFile[]> {
    if (!this.connected) throw new Error('SFTP not connected');

    const files: PolledFile[] = [];
    const listing = await this.sftp.list(remoteDir);

    for (const fileInfo of listing) {
      // Skip directories and hidden files
      if (fileInfo.type === 'd' || fileInfo.name.startsWith('.')) continue;

      const remotePath = `${remoteDir}/${fileInfo.name}`;

      try {
        // Download file content as string
        const buffer = await this.sftp.get(remotePath);
        const content = typeof buffer === 'string' ? buffer : buffer.toString('utf8');

        files.push({
          filename: fileInfo.name,
          content,
          modifiedAt: new Date(fileInfo.modifyTime),
        });
      } catch (err) {
        console.error(`[SFTP] Error reading ${remotePath}:`, (err as Error).message);
      }
    }

    return files;
  }

  /**
   * Upload an outgoing EDI document to partner SFTP server.
   */
  async uploadOutgoing(remoteDir: string, filename: string, content: string): Promise<void> {
    if (!this.connected) throw new Error('SFTP not connected');

    const remotePath = `${remoteDir}/${filename}`;
    const buffer = Buffer.from(content, 'utf8');
    await this.sftp.put(buffer, remotePath);
  }

  /**
   * Mark a file as processed by moving it to a 'processed' subdirectory.
   */
  async markProcessed(remoteDir: string, filename: string): Promise<void> {
    if (!this.connected) throw new Error('SFTP not connected');

    const source = `${remoteDir}/${filename}`;
    const processedDir = `${remoteDir}/processed`;

    // Ensure processed directory exists
    try {
      await this.sftp.mkdir(processedDir, true);
    } catch {
      // Directory may already exist
    }

    const dest = `${processedDir}/${filename}`;
    await this.sftp.rename(source, dest);
  }

  /**
   * Test SFTP connection. Returns true if successful.
   */
  async testConnection(config: SftpConfig): Promise<{ success: boolean; error?: string }> {
    const testClient = new SftpClient();
    try {
      await testClient.connect({
        host: config.host,
        port: config.port || 22,
        username: config.username,
        password: config.password,
        ...(config.privateKey ? { privateKey: config.privateKey } : {}),
      });
      await testClient.end();
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Disconnect from SFTP server.
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.sftp.end();
      this.connected = false;
    }
  }
}
