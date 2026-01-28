/**
 * WordPress utility exports for the headless WordPress integration.
 * This barrel file provides a clean import path for all WordPress-related utilities.
 *
 * @module wordpress
 *
 * @example
 * // Import API functions
 * import { getPosts, getPostBySlug, getPageBySlug } from '@/lib/wordpress';
 *
 * // Import data extraction functions
 * import { getTitle, getExcerpt, getAuthor, getCategories } from '@/lib/wordpress';
 *
 * // Import URL utilities
 * import { getCategoryUrl, getAuthorUrl, getPostUrl } from '@/lib/wordpress';
 *
 * // Import block utilities
 * import { getBlockComponent, normalizeBlockName } from '@/lib/wordpress';
 *
 * // Import sanitization
 * import { sanitizeWordPressHtml, sanitizeBlockHtml } from '@/lib/wordpress';
 *
 * // Import types
 * import type { WpPost, WpPage, WpAuthor, WpCategory } from '@/lib/wordpress';
 */

// =============================================================================
// API FUNCTIONS
// =============================================================================

export {
    // Post fetching
    getPosts,
    getPostsForListing,
    getPostById,
    getPostBySlug,
    getPostBySlugCached,
    // Page fetching
    getPageById,
    getPageBySlug,
    getPageBySlugCached,
    // Category fetching
    getCategoryById,
} from './api';

// =============================================================================
// DATA EXTRACTION FUNCTIONS
// =============================================================================

export {
    // HTML utilities
    decodeHtmlEntities,
    // Date functions
    getFormattedDate,
    getIsoDate,
    getFormattedModifiedDate,
    // Title and content
    getTitle,
    getExcerpt,
    getSlug,
    // Author functions
    getAuthor,
    getAuthorName,
    getAuthorAvatarUrl,
    getAuthorSlug,
    // Taxonomy functions
    getCategories,
    getCategoryNames,
    getPrimaryCategory,
    getTags,
    getTagNames,
    // Media functions
    getFeaturedImageUrl,
    getFeaturedImageAlt,
    getContentImages,
    getFirstContentImage,
    // Reading time
    getReadingTime,
    getReadingTimeText,
} from './data';

// =============================================================================
// URL UTILITIES
// =============================================================================

export {
    getCategoryUrl,
    getAuthorUrl,
    getPostUrl,
    getTagUrl,
    extractSlugFromUrl,
} from './urls';

// =============================================================================
// BLOCK UTILITIES
// =============================================================================

export {
    // Block name utilities
    normalizeBlockName,
    getBlockNamespace,
    getBlockType,
    isBlockFromNamespace,
    isCoreBlock,
    // Block component registry
    getBlockComponent,
    hasBlockComponent,
    getRegisteredBlockNames,
    blockComponents,
} from './blocks';

// =============================================================================
// SANITIZATION
// =============================================================================

export {
    sanitizeWordPressHtml,
    sanitizeBlockHtml,
} from './sanitize';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export all types from the centralized types module
export type {
    // Rendered content
    WpRenderedField,
    // Users/Authors
    WpAuthor,
    // Taxonomy
    WpTerm,
    WpCategory,
    WpTag,
    // Media
    WpMediaSize,
    WpMediaDetails,
    WpMedia,
    ContentImage,
    // Blocks
    GutenbergBlockAttributes,
    GutenbergBlock,
    // Embedded data
    WpEmbedded,
    // Content types
    WpContentBase,
    WpPost,
    WpPage,
    // Pagination
    WpPaginationMeta,
    WpPaginatedPosts,
    // API options
    GetPostsOptions,
    DateFormatOptions,
} from './types';
