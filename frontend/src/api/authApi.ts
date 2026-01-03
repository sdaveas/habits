/**
 * Authentication API endpoints
 */

import { API_ENDPOINTS } from '../constants/API_ENDPOINTS';
import { fetchAPI } from './apiClient';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from '../types/AuthTypes';

/**
 * Register a new user
 */
export async function register(
  request: RegisterRequest
): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Login existing user
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Change user password
 */
export async function changePassword(
  request: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return fetchAPI<ChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Delete user account
 */
export async function deleteAccount(
  request: DeleteAccountRequest
): Promise<DeleteAccountResponse> {
  return fetchAPI<DeleteAccountResponse>(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
    method: 'DELETE',
    body: JSON.stringify(request),
  });
}

/**
 * Get salts for a username
 * Returns all salts associated with the username (since usernames are not unique)
 */
export async function getSalts(username: string): Promise<{ salts: string[] }> {
  return fetchAPI<{ salts: string[] }>(
    `${API_ENDPOINTS.AUTH.GET_SALTS}?username=${encodeURIComponent(username)}`,
    {
      method: 'GET',
    }
  );
}

