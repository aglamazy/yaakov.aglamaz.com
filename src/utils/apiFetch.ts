import { landingPage } from "@/app/settings";
import { shouldRefreshToken } from "@/auth/clientAuth";
import { ApiRoute, apiRoutePaths, getApiPath } from './urls';

let refreshPromise: Promise<Response> | null = null;

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  pathParams?: Record<string, string | undefined>;
  queryParams?: Record<string, string | undefined>;
}

function refreshOnce() {
  return (refreshPromise ??= fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  }).finally(() => {
    refreshPromise = null;
  }));
}

// Endpoints that should bypass refresh logic
const AUTH_RE = /^\/api\/auth\/(refresh|login|logout)(?:$|\?)/;

/**
 * Type-safe API fetch function that only accepts ApiRoute enums
 *
 * Automatically handles:
 * - Path parameter substitution
 * - Query parameter appending
 * - Token refresh on 401
 * - JSON serialization
 *
 * @example
 * // Simple request
 * await apiFetch(ApiRoute.SITE_PUBLIC_INFO)
 *
 * @example
 * // With query params
 * await apiFetch(ApiRoute.SITE_PUBLIC_INFO, {
 *   queryParams: { locale: 'he' }
 * })
 *
 * @example
 * // POST with body
 * await apiFetch(ApiRoute.AUTH_LOGIN, {
 *   method: 'POST',
 *   body: { idToken: '...' }
 * })
 */
export async function apiFetch<T = unknown>(route: ApiRoute, options: ApiFetchOptions = {}): Promise<T> {
  const { pathParams, queryParams, body, ...fetchOptions } = options;

  // Build URL
  const url = getApiPath(route, pathParams, queryParams);

  // Prepare fetch options
  const init: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
  };

  // Handle body serialization
  if (body !== undefined) {
    if (typeof body === 'string') {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers = {
        'Content-Type': 'application/json',
        ...init.headers,
      };
    }
  }

  const req = () => fetch(url, init);

  // 1) Never run refresh logic on login/logout/refresh endpoints themselves
  if (AUTH_RE.test(url)) {
    const r = await req();
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json')
      ? (r.json() as Promise<T>)
      : ((await r.text()) as unknown as T);
  }

  // 2) Normal requests
  let res = await req();

  if (res.status === 401) {
    const rr = await refreshOnce();
    if (rr.ok) res = await req();
  }

  // 3) Still unauthorized -> stop (no loops)
  if (res.status === 401) {
    if (typeof window !== 'undefined' && location.pathname !== landingPage) {
      location.assign(landingPage);
    }
    throw new Error('Unauthorized (apiFetch)');
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const ct = res.headers.get('content-type') || '';
  const result = ct.includes('application/json')
    ? (res.json() as Promise<T>)
    : ((await res.text()) as unknown as T);

  // 4) After response is ready, check if token needs refresh in next event loop (fire and forget)
  setTimeout(() => {
    if (shouldRefreshToken()) {
      console.log('[apiFetch] 🔄 Triggering proactive token refresh (>80% TTL)');
      void refreshOnce(); // Background refresh for next request
    }
  }, 0);

  return result;
}

// Same as apiFetch, but never redirects on 401. Useful for probes like /api/auth/me
export async function apiFetchSilent<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const url = typeof input === 'string' ? input : (input as URL).toString();
  const req = () => fetch(input, { ...init, credentials: 'include' });

  if (AUTH_RE.test(url)) {
    const r = await req();
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json')
      ? (r.json() as Promise<T>)
      : ((await r.text()) as unknown as T);
  }

  let res = await req();
  if (res.status === 401) {
    const rr = await refreshOnce();
    if (rr.ok) res = await req();
  }

  if (res.status === 401) {
    // Do not redirect — let caller decide
    throw new Error('Unauthorized (apiFetchSilent)');
  }

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json')
    ? (res.json() as Promise<T>)
    : ((await res.text()) as unknown as T);
}
