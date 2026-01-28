/**
 * Next.js Middleware for Security Headers
 *
 * This middleware adds essential security headers to all responses,
 * including Content Security Policy (CSP), X-Frame-Options, and other
 * protections against common web vulnerabilities.
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Content Security Policy directives.
 *
 * CSP is a powerful security feature that helps prevent XSS attacks
 * by controlling which resources the browser is allowed to load.
 */
const CSP_DIRECTIVES = {
  // Default fallback for all resource types not explicitly specified
  'default-src': ["'self'"],

  // JavaScript sources
  // 'unsafe-inline' is needed for Next.js inline scripts
  // 'unsafe-eval' is needed for development mode hot reload
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    // Allow eval only in development for hot reload
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  ],

  // Stylesheets
  // 'unsafe-inline' is required for styled-jsx and CSS-in-JS solutions
  'style-src': ["'self'", "'unsafe-inline'"],

  // Images can come from self, WordPress API, and data URIs for inline images
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    // WordPress media domains
    'https://*.wordpress.com',
    'https://*.wp.com',
    // Allow images from WordPress API
    'https://nerdcowcouk.local',
    // Gravatar for author avatars
    'https://secure.gravatar.com',
    'https://*.gravatar.com',
  ],

  // Font sources
  'font-src': ["'self'", 'data:'],

  // Frame sources for embedded content (YouTube, Vimeo)
  'frame-src': [
    "'self'",
    'https://www.youtube.com',
    'https://youtube.com',
    'https://www.youtube-nocookie.com',
    'https://youtube-nocookie.com',
    'https://player.vimeo.com',
    'https://vimeo.com',
  ],

  // Connect sources for API calls and WebSocket connections
  'connect-src': [
    "'self'",
    // WordPress API
    'https://nerdcowcouk.local',
    // Allow localhost in development for hot reload
    ...(process.env.NODE_ENV === 'development'
      ? ['ws://localhost:*', 'http://localhost:*']
      : []),
  ],

  // Media sources (video, audio)
  'media-src': ["'self'", 'blob:'],

  // Object sources (plugins, Flash, etc.) - should be restricted
  'object-src': ["'none'"],

  // Form submissions
  'form-action': ["'self'"],

  // Base URI restriction
  'base-uri': ["'self'"],

  // Frame ancestors - who can embed this site
  'frame-ancestors': ["'self'"],

  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production'
    ? { 'upgrade-insecure-requests': [] }
    : {}),
};

/**
 * Builds the CSP header string from the directives object.
 *
 * @returns Formatted CSP header value
 */
function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        // Directives like 'upgrade-insecure-requests' have no sources
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers applied to all responses.
 *
 * These headers protect against various attack vectors:
 * - XSS attacks (CSP)
 * - Clickjacking (X-Frame-Options)
 * - MIME type sniffing (X-Content-Type-Options)
 * - Referrer leakage (Referrer-Policy)
 * - Protocol downgrade attacks (Strict-Transport-Security)
 */
const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': buildCSPHeader(),

  // Prevent the page from being embedded in iframes (clickjacking protection)
  // Note: This is superseded by CSP frame-ancestors but kept for older browser support
  'X-Frame-Options': 'SAMEORIGIN',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information sent to other sites
  // strict-origin-when-cross-origin: Send full URL for same-origin, only origin for cross-origin
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Prevent XSS attacks in older browsers (legacy header)
  'X-XSS-Protection': '1; mode=block',

  // DNS prefetch control to prevent information leakage
  'X-DNS-Prefetch-Control': 'on',

  // Permissions policy (replaces Feature-Policy)
  // Restricts access to browser features
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // HTTP Strict Transport Security (only in production)
  // Tells browsers to only use HTTPS for future requests
  ...(process.env.NODE_ENV === 'production'
    ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' }
    : {}),
};

/**
 * Middleware function that adds security headers to all responses.
 *
 * This middleware runs on every request and adds security headers
 * to protect against common web vulnerabilities.
 *
 * @param request - The incoming Next.js request
 * @returns Response with security headers added
 */
export function middleware(request: NextRequest): NextResponse {
  // Create response and continue to next handler
  const response = NextResponse.next();

  // Add all security headers to the response
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
}

/**
 * Middleware configuration.
 *
 * Specifies which paths the middleware should run on.
 * We apply security headers to all paths except for:
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - they handle their own headers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
