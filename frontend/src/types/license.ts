export interface License {
  id: string;
  companyId: string;
  type: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'expired' | 'grace' | 'blocked';
  seats: number;
  issuedAt: Date;
  expiresAt: Date;
  gracePeriodEndsAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseValidation {
  isValid: boolean;
  status: 'active' | 'expired' | 'grace' | 'blocked' | 'none';
  message?: string;
  daysUntilExpiry?: number;
  daysInGracePeriod?: number;
}
