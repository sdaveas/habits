/**
 * Authentication state store
 * 
 * NOTE: Never stores encryption keys or passwords
 */

import { create } from 'zustand';
import { setAuthToken } from '../api/apiClient';
import { STORAGE_KEYS } from '../constants/STORAGE_KEYS';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  vaultId: string | null;
  token: string | null;
  login: (username: string, token: string, vaultId?: string) => void;
  logout: () => void;
  restoreSession: () => void;
}

// Load persisted auth state from localStorage
function loadAuthState(): {
  token: string | null;
  username: string | null;
  vaultId: string | null;
} {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE.AUTH_TOKEN);
    const username = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE.USERNAME);
    const vaultId = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE.VAULT_ID);
    
    return {
      token: token || null,
      username: username || null,
      vaultId: vaultId || null,
    };
  } catch {
    return { token: null, username: null, vaultId: null };
  }
}

// Save auth state to localStorage
function saveAuthState(
  token: string | null,
  username: string | null,
  vaultId: string | null
): void {
  try {
    if (token && username) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE.USERNAME, username);
      if (vaultId) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE.VAULT_ID, vaultId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE.VAULT_ID);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE.USERNAME);
      localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE.VAULT_ID);
    }
  } catch {
    // Ignore localStorage errors (e.g., in private browsing mode)
  }
}

const persistedState = loadAuthState();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!persistedState.token,
  username: persistedState.username,
  vaultId: persistedState.vaultId,
  token: persistedState.token,
  login: (username: string, token: string, vaultId?: string) => {
    setAuthToken(token);
    saveAuthState(token, username, vaultId || null);
    set({
      isAuthenticated: true,
      username,
      token,
      vaultId: vaultId || null,
    });
  },
  logout: () => {
    setAuthToken(null);
    saveAuthState(null, null, null);
    set({
      isAuthenticated: false,
      username: null,
      vaultId: null,
      token: null,
    });
  },
  restoreSession: () => {
    const state = loadAuthState();
    if (state.token && state.username) {
      setAuthToken(state.token);
      set({
        isAuthenticated: true,
        username: state.username,
        token: state.token,
        vaultId: state.vaultId,
      });
    }
  },
}));

