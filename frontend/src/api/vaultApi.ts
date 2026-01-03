/**
 * Vault management API endpoints
 */

import { API_ENDPOINTS } from '../constants/API_ENDPOINTS';
import { fetchAPI } from './apiClient';
import type {
  VaultBlob,
  CreateVaultResponse,
  GetVaultResponse,
  UpdateVaultResponse,
  DeleteVaultResponse,
} from './types';

/**
 * Create a new vault
 */
export async function createVault(blob: VaultBlob): Promise<CreateVaultResponse> {
  return fetchAPI<CreateVaultResponse>(API_ENDPOINTS.VAULT.CREATE, {
    method: 'POST',
    body: JSON.stringify(blob),
  });
}

/**
 * Get vault by ID
 */
export async function getVault(vaultId: string): Promise<GetVaultResponse> {
  return fetchAPI<GetVaultResponse>(API_ENDPOINTS.VAULT.GET(vaultId), {
    method: 'GET',
  });
}

/**
 * Get all vaults for the authenticated user
 */
export async function getAllVaults(): Promise<GetVaultResponse[]> {
  return fetchAPI<GetVaultResponse[]>(API_ENDPOINTS.VAULT.GET_ALL, {
    method: 'GET',
  });
}

/**
 * Update existing vault
 */
export async function updateVault(
  vaultId: string,
  blob: VaultBlob
): Promise<UpdateVaultResponse> {
  return fetchAPI<UpdateVaultResponse>(API_ENDPOINTS.VAULT.UPDATE(vaultId), {
    method: 'PUT',
    body: JSON.stringify(blob),
  });
}

/**
 * Delete vault
 */
export async function deleteVault(vaultId: string): Promise<DeleteVaultResponse> {
  return fetchAPI<DeleteVaultResponse>(API_ENDPOINTS.VAULT.DELETE(vaultId), {
    method: 'DELETE',
  });
}

