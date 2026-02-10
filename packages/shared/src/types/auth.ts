import type { UUID, ISOTimestamp, Timestamps } from './common';

// ─── Users & Tenants ───

export interface Tenant extends Timestamps {
  id: UUID;
  name: string;
  slug: string;
  isActive: boolean;
  plan?: SubscriptionPlan;
}

export interface User extends Timestamps {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: UUID;
  isActive: boolean;
  roles: Role[];
}

export interface Role extends Timestamps {
  id: UUID;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: UUID;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  token: string;
  expiresAt: ISOTimestamp;
}

// ─── Admin Auth ───

export interface AdminUser extends Timestamps {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
}

// ─── Subscriptions ───

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

export interface Subscription extends Timestamps {
  id: UUID;
  tenantId: UUID;
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  currentPeriodStart: ISOTimestamp;
  currentPeriodEnd: ISOTimestamp;
  monthlyPrice: number;
}
