// Common types used across all entities

export type UUID = string;
export type ISODate = string;       // 'YYYY-MM-DD'
export type ISOTimestamp = string;   // 'YYYY-MM-DDTHH:mm:ss.sssZ'
export type Currency = string;      // 'USD', 'EUR', etc.

export interface Timestamps {
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface AuditFields extends Timestamps {
  createdBy: UUID;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Status = 'active' | 'inactive';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface MoneyAmount {
  amount: number;
  currency: Currency;
}
