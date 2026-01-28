/**
 * WordPress API Fetch Utilities
 *
 * This module provides functions for fetching data from the WordPress REST API.
 * All functions use parameterized queries, input validation, and proper error handling.
 *
 * @module wordpress/api
 */

import { cache } from 'react';
import type {
    WpPost,
    WpPage,
    WpCategory,
    WpAuthor,
    WpTerm,
    ContentImage,
    GutenbergBlock,
    WpPaginatedPosts,
    GetPostsOptions,
} from '@/types';

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

// Validate WORDPRESS_API_URL environment variable at module load time
const WP_API_URL = process.env.WORDPRESS_API_URL;

if (!WP_API_URL) {
    throw new Error(
        'WORDPRESS_API_URL environment variable is not defined. ' +
        'Please set it in your .env.local file (e.g., WORDPRESS_API_URL=https://your-site.com/wp-json/wp/v2)'
    );
}

// Validate that the URL is properly formatted
try {
    new URL(WP_API_URL);
} catch {
    throw new Error(
        `WORDPRESS_API_URL is not a valid URL: "${WP_API_URL}". ` +
        'Please provide a valid URL (e.g., https://your-site.com/wp-json/wp/v2)'
    );
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

/**
 * Caching configuration for different content types.
 * Values are in seconds for Next.js revalidate option.
 */
const CACHE_CONFIG = {
    /** Homepage content - refreshes every 5 minutes */
    homepage: 300,
    /** Post listing pages - refreshes every 1 minute for fresh content */
    postListing: 60,
    /** Individual post pages - refreshes every 5 minutes */
    singlePost: 300,
    /** Individual page content - refreshes every 5 minutes */
    singlePage: 300,
    /** Category data - refreshes every 1 hour (rarely changes) */
    categories: 3600,
    /** Author data - refreshes every 1 hour (rarely changes) */
    authors: 3600,
} as const;

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates that an ID is a positive integer.
 *
 * @param id - The ID to validate
 * @returns True if the ID is a valid positive integer
 */
function isValidId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
}

/**
 * Validates and sanitizes a slug string.
 *
 * @param slug - The slug to validate
 * @returns The trimmed slug if valid, null otherwise
 */
function validateSlug(slug: string): string | null {
    const trimmedSlug = slug?.trim();
    if (!trimmedSlug) {
        return null;
    }
    return trimmedSlug;
}

// =============================================================================
// POST API FUNCTIONS
// =============================================================================

/**
 * Fetches posts from the WordPress REST API with pagination and filtering support.
 *
 * @param options - Configuration options for fetching posts
 * @param options.perPage - Number of posts per page (1-100, default: 10)
 * @param options.page - Page number to fetch (1-indexed, default: 1)
 * @param options.categoryId - Filter by category ID
 * @param options.authorId - Filter by author ID
 * @param options.search - Search query string
 * @param options.orderBy - Field to order by (default: 'date')
 * @param options.order - Order direction (default: 'desc')
 * @returns Paginated posts response with metadata
 *
 * @example
 * // Fetch first page of 10 posts
 * const { posts, totalPages } = await getPosts();
 *
 * @example
 * // Fetch page 2 with 20 posts per page, filtered by category
 * const result = await getPosts({ perPage: 20, page: 2, categoryId: 5 });
 */
export async function getPosts(options: GetPostsOptions = {}): Promise<WpPaginatedPosts> {
    const {
        perPage = 10,
        page = 1,
        categoryId,
        authorId,
        search,
        orderBy = 'date',
        order = 'desc'
    } = options;

    // Validate and constrain pagination parameters
    // perPage must be between 1 and 100 (WordPress API limit)
    const validPerPage = Math.min(Math.max(1, perPage), 100);
    // page must be at least 1
    const validPage = Math.max(1, page);

    // Build query parameters using URLSearchParams for proper encoding
    const params = new URLSearchParams({
        _embed: 'true',
        per_page: validPerPage.toString(),
        page: validPage.toString(),
        orderby: orderBy,
        order: order,
    });

    // Add optional filters only if they have valid values
    if (categoryId && Number.isInteger(categoryId) && categoryId > 0) {
        params.append('categories', categoryId.toString());
    }
    if (authorId && Number.isInteger(authorId) && authorId > 0) {
        params.append('author', authorId.toString());
    }
    if (search?.trim()) {
        params.append('search', search.trim());
    }

    try {
        const response = await fetch(`${WP_API_URL}/posts?${params}`, {
            next: { revalidate: CACHE_CONFIG.postListing }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch posts: HTTP ${response.status} ${response.statusText}`
            );
            return { posts: [], totalPosts: 0, totalPages: 0, currentPage: validPage };
        }

        const posts: WpPost[] = await response.json();

        // WordPress returns pagination info in response headers
        const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

        return {
            posts,
            totalPosts,
            totalPages,
            currentPage: validPage
        };
    } catch (error) {
        console.error('Network error fetching posts:', error);
        return { posts: [], totalPosts: 0, totalPages: 0, currentPage: validPage };
    }
}

/**
 * Fetches posts with minimal fields optimized for listing pages.
 * More efficient than getPosts for card displays as it requests only necessary fields.
 *
 * @param options - Configuration options for fetching posts
 * @param options.perPage - Number of posts per page (1-100, default: 10)
 * @param options.page - Page number to fetch (1-indexed, default: 1)
 * @param options.orderBy - Field to order by (default: 'date')
 * @param options.order - Order direction (default: 'desc')
 * @returns Paginated posts response with minimal post data
 *
 * @example
 * // Fetch lightweight posts for a card grid
 * const { posts, totalPages } = await getPostsForListing({ perPage: 12 });
 */
export async function getPostsForListing(options: GetPostsOptions = {}): Promise<WpPaginatedPosts> {
    const {
        perPage = 10,
        page = 1,
        orderBy = 'date',
        order = 'desc'
    } = options;

    // Validate and constrain pagination parameters
    const validPerPage = Math.min(Math.max(1, perPage), 100);
    const validPage = Math.max(1, page);

    // Build query with minimal fields for optimal performance
    // Only request fields needed for post cards/listings
    const params = new URLSearchParams({
        _embed: 'author',  // Only embed author data, not all terms
        _fields: 'id,slug,title,excerpt,date,_embedded,estimatedReadingTime,contentImages',
        per_page: validPerPage.toString(),
        page: validPage.toString(),
        orderby: orderBy,
        order: order,
    });

    try {
        const response = await fetch(`${WP_API_URL}/posts?${params}`, {
            next: { revalidate: CACHE_CONFIG.postListing }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch posts for listing: HTTP ${response.status} ${response.statusText}`
            );
            return { posts: [], totalPosts: 0, totalPages: 0, currentPage: validPage };
        }

        const posts: WpPost[] = await response.json();

        // Extract pagination metadata from WordPress response headers
        const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

        return {
            posts,
            totalPosts,
            totalPages,
            currentPage: validPage
        };
    } catch (error) {
        console.error('Network error fetching posts for listing:', error);
        return { posts: [], totalPosts: 0, totalPages: 0, currentPage: validPage };
    }
}

/**
 * Fetches a single post by its ID from the WordPress REST API.
 *
 * @param id - The WordPress post ID (must be a positive integer)
 * @returns The post object, or null if not found, invalid ID, or on error
 * @throws Never throws - returns null on any error condition
 */
export async function getPostById(id: number): Promise<WpPost | null> {
    // Validate input - ID must be a positive integer
    if (!isValidId(id)) {
        console.error(`Invalid post ID: ${id}. Expected a positive integer.`);
        return null;
    }

    try {
        const response = await fetch(`${WP_API_URL}/posts/${id}?_embed`, {
            next: { revalidate: CACHE_CONFIG.singlePost }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch post by ID "${id}": HTTP ${response.status} ${response.statusText}`
            );
            return null;
        }

        const post: WpPost = await response.json();
        return post;
    } catch (error) {
        console.error(`Network error fetching post by ID "${id}":`, error);
        return null;
    }
}

/**
 * Fetches a single post by its slug from the WordPress REST API.
 *
 * @param slug - The WordPress post slug
 * @returns The post object, or null if not found, empty slug, or on error
 * @throws Never throws - returns null on any error condition
 */
export async function getPostBySlug(slug: string): Promise<WpPost | null> {
    // Validate input - slug must be a non-empty string after trimming
    const trimmedSlug = validateSlug(slug);
    if (!trimmedSlug) {
        console.error('Empty or invalid slug provided to getPostBySlug');
        return null;
    }

    try {
        // Use encodeURIComponent to safely handle special characters in slugs
        const response = await fetch(`${WP_API_URL}/posts?slug=${encodeURIComponent(trimmedSlug)}&_embed`, {
            next: { revalidate: CACHE_CONFIG.singlePost }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch post by slug "${trimmedSlug}": HTTP ${response.status} ${response.statusText}`
            );
            return null;
        }

        const posts: WpPost[] = await response.json();

        // WordPress REST API returns an array, get the first post
        if (!posts || posts.length === 0) {
            return null;
        }

        return posts[0];
    } catch (error) {
        console.error(`Network error fetching post by slug "${trimmedSlug}":`, error);
        return null;
    }
}

/**
 * Cached version of getPostBySlug - deduplicates requests within a single render.
 * Use this in server components when the same post might be requested multiple times.
 *
 * @param slug - The WordPress post slug
 * @returns The post object, or null if not found
 */
export const getPostBySlugCached = cache(async (slug: string): Promise<WpPost | null> => {
    return getPostBySlug(slug);
});

// =============================================================================
// PAGE API FUNCTIONS
// =============================================================================

/**
 * Fetches a single page by its ID from the WordPress REST API.
 *
 * @param id - The WordPress page ID (must be a positive integer)
 * @returns The page object, or null if not found, invalid ID, or on error
 * @throws Never throws - returns null on any error condition
 */
export async function getPageById(id: number): Promise<WpPage | null> {
    // Validate input - ID must be a positive integer
    if (!isValidId(id)) {
        console.error(`Invalid page ID: ${id}. Expected a positive integer.`);
        return null;
    }

    try {
        const response = await fetch(`${WP_API_URL}/pages/${id}?_embed`, {
            next: { revalidate: CACHE_CONFIG.singlePage }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch page by ID "${id}": HTTP ${response.status} ${response.statusText}`
            );
            return null;
        }

        const page: WpPage = await response.json();
        return page;
    } catch (error) {
        console.error(`Network error fetching page by ID "${id}":`, error);
        return null;
    }
}

/**
 * Fetches a single page by its slug from the WordPress REST API.
 *
 * @param slug - The WordPress page slug (e.g., 'home', 'about')
 * @returns The page object, or null if not found, empty slug, or on error
 * @throws Never throws - returns null on any error condition
 */
export async function getPageBySlug(slug: string): Promise<WpPage | null> {
    // Validate input - slug must be a non-empty string after trimming
    const trimmedSlug = validateSlug(slug);
    if (!trimmedSlug) {
        console.error('Empty or invalid slug provided to getPageBySlug');
        return null;
    }

    try {
        // Use encodeURIComponent to safely handle special characters in slugs
        const response = await fetch(`${WP_API_URL}/pages?slug=${encodeURIComponent(trimmedSlug)}&_embed`, {
            next: { revalidate: CACHE_CONFIG.singlePage }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch page by slug "${trimmedSlug}": HTTP ${response.status} ${response.statusText}`
            );
            return null;
        }

        const pages: WpPage[] = await response.json();

        // WordPress REST API returns an array, get the first page
        if (!pages || pages.length === 0) {
            return null;
        }

        return pages[0];
    } catch (error) {
        console.error(`Network error fetching page by slug "${trimmedSlug}":`, error);
        return null;
    }
}

/**
 * Cached version of getPageBySlug - deduplicates requests within a single render.
 * Use this in server components when the same page might be requested multiple times.
 *
 * @param slug - The WordPress page slug
 * @returns The page object, or null if not found
 */
export const getPageBySlugCached = cache(async (slug: string): Promise<WpPage | null> => {
    return getPageBySlug(slug);
});

// =============================================================================
// CATEGORY API FUNCTIONS
// =============================================================================

/**
 * Fetches a category by its ID from the WordPress REST API.
 *
 * @param id - The WordPress category ID (must be a positive integer)
 * @returns The category object, or null if not found, invalid ID, or on error
 * @throws Never throws - returns null on any error condition
 */
export async function getCategoryById(id: number): Promise<WpCategory | null> {
    // Validate input - ID must be a positive integer
    if (!isValidId(id)) {
        console.error(`Invalid category ID: ${id}. Expected a positive integer.`);
        return null;
    }

    try {
        const response = await fetch(`${WP_API_URL}/categories/${id}`, {
            next: { revalidate: CACHE_CONFIG.categories }
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch category by ID "${id}": HTTP ${response.status} ${response.statusText}`
            );
            return null;
        }

        const category: WpCategory = await response.json();

        // Single category endpoint returns an object, not an array
        if (!category) {
            return null;
        }

        return category;
    } catch (error) {
        console.error(`Network error fetching category by ID "${id}":`, error);
        return null;
    }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export types for convenience when importing from this module
export type {
    WpPost,
    WpPage,
    WpCategory,
    WpAuthor,
    WpTerm,
    ContentImage,
    GutenbergBlock,
    WpPaginatedPosts,
    GetPostsOptions,
};
