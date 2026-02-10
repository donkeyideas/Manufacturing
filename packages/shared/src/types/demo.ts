import type { UUID, ISOTimestamp, AuditFields } from './common';

// ─── Demo Access Codes ───

export interface DemoAccessCode extends AuditFields {
  id: UUID;
  code: string;
  createdByAdminId: UUID;
  expiresAt: ISOTimestamp;
  modulesEnabled: string[];
  template: DemoTemplate;
  isActive: boolean;
  usageCount: number;
  maxUses: number;
  label?: string;
}

export type DemoTemplate = 'manufacturing' | 'distribution' | 'full';

export interface DemoValidationRequest {
  code: string;
}

export interface DemoValidationResponse {
  valid: boolean;
  token?: string;
  expiresAt?: ISOTimestamp;
  modulesEnabled?: string[];
  template?: DemoTemplate;
  error?: string;
}

export interface GenerateDemoCodeRequest {
  expirationDays: 7 | 14 | 30;
  modulesEnabled: string[];
  template: DemoTemplate;
  maxUses: number;
  label?: string;
}
