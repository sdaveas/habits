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
  salt: string; // Base64-encoded salt (snake_case from backend)
}

export interface RegisterRequest extends AuthRequest {
  salt: string; // Base64-encoded salt (required for registration)
}

export interface LoginRequest {
  username: string;
  auth_hash: string; // Base64-encoded H_auth (snake_case for backend)
}

export interface ChangePasswordRequest {
  old_auth_hash: string; // Base64-encoded H_auth from old password
  new_auth_hash: string; // Base64-encoded H_auth from new password
  new_salt: string; // Base64-encoded new salt
  vault_ciphertext: string; // Re-encrypted vault data (base64)
  vault_iv: string; // New IV for re-encrypted vault (base64)
  vault_version: number; // Vault version (preserve existing)
}

export interface ChangePasswordResponse {
  message: string;
}

export interface DeleteAccountRequest {
  password_auth_hash: string; // Base64-encoded H_auth from password
}

export interface DeleteAccountResponse {
  message: string;
}

