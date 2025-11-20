/**
 * Route enums for yaakov.aglamaz.com (single-site architecture)
 */

export enum AppRoute {
  // Public pages
  HOME = 'HOME',
  CONTACT = 'CONTACT',

  // Auth pages
  AUTH_LOGIN = 'AUTH_LOGIN',

  // Admin pages
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

/**
 * API route enum for centralized API URL generation
 * Single-site architecture - no siteId required
 */
export enum ApiRoute {
  // Auth routes
  AUTH_ME = 'AUTH_ME',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_REFRESH = 'AUTH_REFRESH',
  AUTH_LOGIN = 'AUTH_LOGIN',

  // Site info
  SITE_PUBLIC_INFO = 'SITE_PUBLIC_INFO',
}

export interface UrlParams {
  locale?: string;
  [key: string]: string | undefined;
}
