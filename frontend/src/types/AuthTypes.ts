/**
 * Authentication types
 */

export interface AuthRequest {
  username: string;
  auth_hash: string; // Base64-encoded H_auth (snake_case for backend)
}

export interface AuthResponse {
  access_token: string; // JWT token (snake_case from backend)
  token_type: string; // Usually "bearer"
  vault_id?: string | null; // Optional vault ID (snake_case from backend)
}

export interface RegisterRequest extends AuthRequest {
  salt: string; // Base64-encoded salt (required for registration)
}

export interface LoginRequest {
  username: string;
  auth_hash: string; // Base64-encoded H_auth (snake_case for backend)
}

