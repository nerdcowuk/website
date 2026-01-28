/**
 * WordPress HTML Sanitization Utility
 *
 * Provides secure sanitization for HTML content received from WordPress.
 * This module prevents XSS attacks while preserving legitimate content
 * that WordPress commonly outputs.
 *
 * @module lib/wordpress/sanitize
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Allowed iframe source domains for embedded content.
 * Only trusted video platforms are permitted to prevent malicious embeds.
 */
const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
];

/**
 * Safe URL schemes that are permitted in href and src attributes.
 * Prevents javascript:, data:, and other potentially dangerous protocols.
 */
const ALLOWED_URL_SCHEMES = ['http', 'https', 'mailto', 'tel'];

/**
 * Block-level HTML elements commonly used in WordPress content.
 * These provide document structure and layout.
 */
const ALLOWED_BLOCK_ELEMENTS = [
  'article',
  'section',
  'nav',
  'aside',
  'header',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'div',
  'span',
  'blockquote',
  'pre',
  'code',
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
  'figure',
  'figcaption',
  'address',
  'main',
];

/**
 * Inline HTML elements for text formatting and links.
 * These elements appear within block-level content.
 */
const ALLOWED_INLINE_ELEMENTS = [
  'a',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'mark',
  'small',
  'sub',
  'sup',
  'abbr',
  'cite',
  'q',
  'br',
  'hr',
  'wbr',
  'del',
  'ins',
  'kbd',
  'samp',
  'var',
  'time',
  'data',
  'bdo',
  'bdi',
  'ruby',
  'rt',
  'rp',
];

/**
 * Media elements for images, video, and audio content.
 * Includes iframe for embedded content from trusted sources.
 */
const ALLOWED_MEDIA_ELEMENTS = [
  'img',
  'video',
  'audio',
  'source',
  'track',
  'picture',
  'iframe',
];

/**
 * Interactive disclosure elements.
 * Used for collapsible content sections.
 */
const ALLOWED_INTERACTIVE_ELEMENTS = ['details', 'summary'];

/**
 * Complete list of all allowed HTML tags.
 */
const ALLOWED_TAGS = [
  ...ALLOWED_BLOCK_ELEMENTS,
  ...ALLOWED_INLINE_ELEMENTS,
  ...ALLOWED_MEDIA_ELEMENTS,
  ...ALLOWED_INTERACTIVE_ELEMENTS,
];

/**
 * Attribute configuration for allowed HTML elements.
 * Defines which attributes are permitted on each element type.
 */
const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  // Global attributes allowed on all elements
  '*': ['class', 'id', 'lang', 'dir', 'title', 'aria-*', 'data-*', 'role'],

  // Link attributes
  a: ['href', 'target', 'rel', 'hreflang', 'type', 'download'],

  // Image attributes
  img: [
    'src',
    'srcset',
    'sizes',
    'alt',
    'width',
    'height',
    'loading',
    'decoding',
  ],

  // Video attributes
  video: [
    'src',
    'poster',
    'width',
    'height',
    'controls',
    'autoplay',
    'loop',
    'muted',
    'playsinline',
    'preload',
  ],

  // Audio attributes
  audio: ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'],

  // Media source attributes
  source: ['src', 'srcset', 'type', 'media', 'sizes'],

  // Track attributes for captions/subtitles
  track: ['src', 'kind', 'srclang', 'label', 'default'],

  // Picture element
  picture: [],

  // Iframe attributes (restricted to trusted sources)
  iframe: [
    'src',
    'width',
    'height',
    'frameborder',
    'allow',
    'allowfullscreen',
    'loading',
    'title',
  ],

  // Table attributes
  table: ['border', 'cellpadding', 'cellspacing', 'summary'],
  th: ['scope', 'colspan', 'rowspan', 'headers', 'abbr'],
  td: ['colspan', 'rowspan', 'headers'],
  col: ['span'],
  colgroup: ['span'],

  // Quote and citation attributes
  blockquote: ['cite'],
  q: ['cite'],
  cite: [],

  // Time element
  time: ['datetime'],

  // Data element
  data: ['value'],

  // Abbreviation
  abbr: ['title'],

  // Bidirectional text
  bdo: ['dir'],
  bdi: [],

  // Details/Summary for disclosure widgets
  details: ['open'],
  summary: [],

  // Ordered list attributes
  ol: ['start', 'reversed', 'type'],

  // List item attributes
  li: ['value'],
};

/**
 * Validates whether an iframe src URL points to an allowed host.
 *
 * @param src - The iframe src URL to validate
 * @returns True if the URL is from an allowed host, false otherwise
 */
function isAllowedIframeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_HOSTS.includes(url.hostname);
  } catch {
    // Invalid URL - reject it
    return false;
  }
}

/**
 * Sanitizes HTML content from WordPress to prevent XSS attacks.
 *
 * This function processes raw HTML from WordPress and removes potentially
 * dangerous elements while preserving legitimate content. It handles:
 * - Stripping script and style tags
 * - Removing event handlers (onclick, onerror, etc.)
 * - Validating URL schemes (blocking javascript:, data:, etc.)
 * - Restricting iframe sources to trusted video platforms
 * - Adding security attributes to external links
 *
 * @param html - The raw HTML string from WordPress to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * import { sanitizeWordPressHtml } from '@/lib/wordpress/sanitize';
 *
 * // In a React component
 * const safeHtml = sanitizeWordPressHtml(post.content.rendered);
 * return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
 * ```
 *
 * @throws Never throws - returns empty string for null/undefined input
 */
export function sanitizeWordPressHtml(html: string | null | undefined): string {
  // Handle null/undefined input gracefully
  if (!html) {
    return '';
  }

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,

    // Allow only safe URL schemes
    allowedSchemes: ALLOWED_URL_SCHEMES,

    // Configure scheme filtering for specific attributes
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto', 'tel'],
      img: ['http', 'https'],
      video: ['http', 'https'],
      audio: ['http', 'https'],
      source: ['http', 'https'],
      iframe: ['https'], // iframes should always use HTTPS
    },

    // Transform tags to add security attributes
    transformTags: {
      // Add rel="noopener noreferrer" to external links for security
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const target = attribs.target || '';

        // Check if this is an external link using proper URL parsing
        // This prevents bypass attacks that could occur with simple string matching
        const isExternal = (() => {
          // Links with target="_blank" are always treated as external for security
          if (target === '_blank') return true;
          if (!href) return false;

          // Relative URLs starting with single slash are internal
          if (href.startsWith('/') && !href.startsWith('//')) return false;

          // Fragment-only links are internal
          if (href.startsWith('#')) return false;

          // mailto: and tel: links are not external in the navigation sense
          if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;

          try {
            const siteUrlStr = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost';
            // Parse href relative to the site URL to handle relative URLs correctly
            const linkUrl = new URL(href, siteUrlStr);
            const siteUrl = new URL(siteUrlStr);
            // Compare hostnames to determine if truly external
            return linkUrl.hostname !== siteUrl.hostname;
          } catch {
            // Invalid URL - treat as internal to avoid blocking legitimate content
            return false;
          }
        })();

        if (isExternal) {
          // Ensure rel attribute includes security values
          const existingRel = attribs.rel || '';
          const relValues = new Set(existingRel.split(' ').filter(Boolean));
          relValues.add('noopener');
          relValues.add('noreferrer');

          return {
            tagName,
            attribs: {
              ...attribs,
              rel: Array.from(relValues).join(' '),
            },
          };
        }

        return { tagName, attribs };
      },

      // Filter iframe sources to only allow trusted video platforms
      iframe: (tagName, attribs): sanitizeHtml.Tag => {
        const src = attribs.src || '';

        // Block iframes from non-allowed sources
        if (!isAllowedIframeSrc(src)) {
          // Return empty div to remove the iframe entirely
          return {
            tagName: 'div',
            attribs: {
              class: 'blocked-embed',
              'data-blocked-src': 'iframe-source-not-allowed',
            },
          };
        }

        // Allow the iframe with loading="lazy" for performance
        return {
          tagName,
          attribs: {
            ...attribs,
            loading: attribs.loading || 'lazy',
          },
        };
      },
    },

    // Strip these tags entirely (including their content)
    exclusiveFilter: (frame) => {
      // Remove empty paragraphs that WordPress sometimes generates
      // Use optional chaining for frame.text to handle potential null/undefined values
      if (frame.tag === 'p' && !frame.text?.trim() && frame.mediaChildren?.length === 0) {
        return true;
      }
      return false;
    },

    // Do not encode entities - we want to preserve Unicode characters
    // The sanitization handles dangerous content; encoding is not needed for security
    // and can cause display issues with special characters
    disallowedTagsMode: 'discard',
  });
}

/**
 * Sanitizes HTML content specifically for Gutenberg block fallback rendering.
 *
 * This is a convenience wrapper around sanitizeWordPressHtml that provides
 * the same sanitization but with a clearer intent for use in the GutenbergRenderer.
 *
 * @param innerHTML - The innerHTML from an unknown Gutenberg block
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * import { sanitizeBlockHtml } from '@/lib/wordpress/sanitize';
 *
 * // In GutenbergRenderer fallback
 * return <div>{parse(sanitizeBlockHtml(block.innerHTML))}</div>;
 * ```
 */
export function sanitizeBlockHtml(innerHTML: string | null | undefined): string {
  return sanitizeWordPressHtml(innerHTML);
}
