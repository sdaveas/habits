/**
 * Base API client with error handling and auth token management
 */

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

let authToken: string | null = null;

/**
 * Set authentication token
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: { error?: { message?: string; code?: string; details?: Record<string, unknown> } } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, use default error
    }

    throw new APIError(
      errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData?.error?.code,
      errorData?.error?.details
    );
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return {} as T;
}

export { fetchAPI };

