/**
 * WordPress REST API fetch utilities.
 * Provides functions for fetching posts, pages, and categories from the WordPress API.
 *
 * @module lib/wp-fetch
 */

import type { WpPost, WpCategory, WpPaginatedPosts } from '@/types';

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

const WP_API_URL = process.env.WORDPRESS_API_URL;

if (!WP_API_URL) {
	throw new Error('WORDPRESS_API_URL environment variable is not defined');
}

// Validate that the URL is properly formatted
try {
	new URL(WP_API_URL);
} catch {
	throw new Error(`WORDPRESS_API_URL is not a valid URL: "${WP_API_URL}"`);
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

/**
 * Caching configuration for different content types.
 * Values are in seconds for Next.js revalidate option.
 */
const CACHE_CONFIG = {
	/** Post listing pages - refreshes every 1 minute for fresh content */
	postListing: 60,
	/** Individual post pages - refreshes every 5 minutes */
	singlePost: 300,
	/** Individual page content - refreshes every 5 minutes */
	singlePage: 300,
	/** Category data - refreshes every 1 hour (rarely changes) */
	categories: 3600,
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
function validateSlug(slug: string | null | undefined): string | null {
	if (slug === null || slug === undefined) {
		return null;
	}
	const trimmedSlug = slug.trim();
	if (!trimmedSlug) {
		return null;
	}
	return trimmedSlug;
}

// =============================================================================
// POST API FUNCTIONS
// =============================================================================

/**
 * Fetches all published posts from the WordPress API.
 *
 * @returns Promise resolving to a PaginatedPosts object with posts array and metadata
 */
export async function getPosts(): Promise<WpPaginatedPosts> {
	try {
		const response = await fetch(`${WP_API_URL}/posts?_embed`, {
			next: { revalidate: CACHE_CONFIG.postListing }
		});

		if (!response.ok) {
			console.error(`Failed to fetch posts: HTTP ${response.status} ${response.statusText}`);
			return { posts: [], totalPosts: 0, totalPages: 0, currentPage: 1 };
		}

		const posts: WpPost[] = await response.json();

		// WordPress returns pagination info in response headers
		const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
		const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

		return {
			posts,
			totalPosts,
			totalPages,
			currentPage: 1
		};
	} catch (error) {
		console.error('Network error fetching posts:', error);
		return { posts: [], totalPosts: 0, totalPages: 0, currentPage: 1 };
	}
}

/**
 * Fetches a post by its ID from the WordPress API.
 *
 * @param id - The WordPress post ID
 * @returns Promise resolving to the post object, or null on error
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
	} catch (error: unknown) {
		console.error(`Network error fetching post by ID "${id}":`, error);
		return null;
	}
}

/**
 * Fetches a post by its slug from the WordPress API.
 *
 * @param slug - The URL-friendly post slug
 * @returns Promise resolving to the WpPost object, or null if not found
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
	} catch (error: unknown) {
		console.error(`Network error fetching post by slug "${trimmedSlug}":`, error);
		return null;
	}
}

// =============================================================================
// PAGE API FUNCTIONS
// =============================================================================

/**
 * Fetches a page by its ID from the WordPress API.
 *
 * @param id - The WordPress page ID
 * @returns Promise resolving to the page object, or null on error
 */
export async function getPageById(id: number): Promise<WpPost | null> {
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

		const page: WpPost = await response.json();
		return page;
	} catch (error: unknown) {
		console.error(`Network error fetching page by ID "${id}":`, error);
		return null;
	}
}

/**
 * Fetches a page by its slug from the WordPress API.
 *
 * @param slug - The URL-friendly page slug
 * @returns Promise resolving to the page object, or null if not found
 */
export async function getPageBySlug(slug: string): Promise<WpPost | null> {
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

		const pages: WpPost[] = await response.json();

		// WordPress REST API returns an array, get the first page
		if (!pages || pages.length === 0) {
			return null;
		}

		return pages[0];
	} catch (error: unknown) {
		console.error(`Network error fetching page by slug "${trimmedSlug}":`, error);
		return null;
	}
}

// =============================================================================
// CATEGORY API FUNCTIONS
// =============================================================================

/**
 * Fetches a category by its ID from the WordPress API.
 *
 * @param id - The WordPress category ID
 * @returns Promise resolving to the WpCategory object, or null if not found
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

		// Note: Categories endpoint returns a single object, not an array
		if (!category) {
			return null;
		}

		return category;
	} catch (error: unknown) {
		console.error(`Network error fetching category by ID "${id}":`, error);
		return null;
	}
}
