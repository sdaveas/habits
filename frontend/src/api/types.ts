/**
 * API request/response types
 */

import type { VaultBlob } from '../types/VaultTypes';

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type CreateVaultResponse = VaultBlob;
export type GetVaultResponse = VaultBlob;
export type UpdateVaultResponse = VaultBlob;
export type DeleteVaultResponse = { success: boolean };

export type { VaultBlob };

