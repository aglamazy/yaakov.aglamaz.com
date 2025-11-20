/**
 * Centralized URL generation utility for yaakov.aglamaz.com
 * Single-site architecture - no siteId required
 */

import { AppRoute, ApiRoute, type UrlParams } from '@/entities/Routes';

// Re-export for convenience
export { AppRoute, ApiRoute, type UrlParams };

/**
 * Route definitions with their path templates
 */
export const routePaths: Record<AppRoute, string> = {
  // Public pages
  [AppRoute.HOME]: '/{locale}',
  [AppRoute.CONTACT]: '/{locale}/contact',

  // Auth pages
  [AppRoute.AUTH_LOGIN]: '/login',

  // Admin pages
  [AppRoute.ADMIN_DASHBOARD]: '/admin/dashboard',
};

/**
 * Get a relative path (without base URL) for a route
 */
export function getPath(
  route: AppRoute,
  params?: UrlParams,
  queryParams?: Record<string, string | undefined>
): string {
  let path = routePaths[route];

  // Substitute path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        path = path.replace(`{${key}}`, value);
      }
    });
  }

  // Check for unsubstituted parameters
  const unsubstituted = path.match(/\{([^}]+)\}/);
  if (unsubstituted) {
    throw new Error(
      `Missing required parameter "${unsubstituted[1]}" for route ${route}. ` +
      `Path template: "${routePaths[route]}"`
    );
  }

  // Add query parameters
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
  }

  return path;
}

/**
 * API route path templates (single-site, no siteId)
 */
export const apiRoutePaths: Record<ApiRoute, string> = {
  // Auth routes
  [ApiRoute.AUTH_ME]: '/api/auth/me',
  [ApiRoute.AUTH_ME_FIREBASE_TOKEN]: '/api/auth/me/firebase-token',
  [ApiRoute.AUTH_LOGOUT]: '/api/auth/logout',
  [ApiRoute.AUTH_REFRESH]: '/api/auth/refresh',
  [ApiRoute.AUTH_LOGIN]: '/api/auth/login',

  // Site info
  [ApiRoute.SITE_PUBLIC_INFO]: '/api/site',
};

/**
 * Get an API path with path params substituted
 */
export function getApiPath(
  route: ApiRoute,
  pathParams?: Record<string, string | undefined>,
  queryParams?: Record<string, string | undefined>
): string {
  let path = apiRoutePaths[route];

  // Substitute path parameters
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      if (value !== undefined) {
        path = path.replace(`{${key}}`, value);
      }
    });
  }

  // Check for unsubstituted parameters
  const unsubstituted = path.match(/\{([^}]+)\}/);
  if (unsubstituted) {
    throw new Error(
      `Missing required path parameter "${unsubstituted[1]}" for route ${route}. ` +
      `Path template: "${apiRoutePaths[route]}"`
    );
  }

  // Add query parameters
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
  }

  return path;
}
