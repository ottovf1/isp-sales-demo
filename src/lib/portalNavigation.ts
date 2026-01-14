/**
 * Portal Navigation
 * Handles navigation between ISP Sales Demo and the-vaultai.com portal
 */

export const PORTAL_URL = 'https://the-vaultai.com';
export const PORTAL_LOGOUT_URL = 'https://the-vaultai.com/logout';
export const PORTAL_LOGIN_URL = 'https://the-vaultai.com/login';

/**
 * Navigate to Vault portal
 */
export function navigateToPortal(path: string = ''): void {
  window.location.href = `${PORTAL_URL}${path}`;
}

/**
 * Navigate to portal login with return URL
 */
export function navigateToLogin(): void {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${PORTAL_LOGIN_URL}?returnUrl=${returnUrl}`;
}

/**
 * Navigate to portal logout
 */
export function navigateToLogout(): void {
  window.location.href = PORTAL_LOGOUT_URL;
}

/**
 * Open portal in new tab
 */
export function openPortalInNewTab(path: string = ''): void {
  window.open(`${PORTAL_URL}${path}`, '_blank');
}
