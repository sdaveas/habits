/**
 * API configuration
 */

// Use VITE_API_URL from environment, fallback to relative path for local dev
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
