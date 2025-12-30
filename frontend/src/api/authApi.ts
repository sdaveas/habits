/**
 * Authentication API endpoints
 */

import { API_ENDPOINTS } from '../constants/API_ENDPOINTS';
import { fetchAPI } from './apiClient';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
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

