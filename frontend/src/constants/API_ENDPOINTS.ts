/**
 * API endpoint constants
 */

const API_BASE = '/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
  },
  VAULT: {
    CREATE: `${API_BASE}/vault`,
    GET: (vaultId: string) => `${API_BASE}/vault/${vaultId}`,
    UPDATE: (vaultId: string) => `${API_BASE}/vault/${vaultId}`,
    DELETE: (vaultId: string) => `${API_BASE}/vault/${vaultId}`,
  },
} as const;

