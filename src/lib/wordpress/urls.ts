/**
 * URL transformation utilities for converting WordPress backend URLs
 * to frontend routes in the headless WordPress setup.
 *
 * These utilities ensure that all internal links point to the Next.js
 * frontend routes rather than the WordPress admin/backend URLs.
 *
 * @module wordpress/urls
 */

import type { WpAuthor, WpCategory, WpPost, WpTag } from './types';

/**
 * Validates a slug to ensure it is safe for use in URL paths.
 * Prevents path traversal attacks and other malformed inputs.
 *
 * @param slug - The slug string to validate
 * @returns True if the slug is valid and safe to use, false otherwise
 *
 * @example
 * isValidSlug('web-design'); // Returns: true
 * isValidSlug('../etc/passwd'); // Returns: false
 * isValidSlug(''); // Returns: false
 *
 * @internal
 */
function isValidSlug(slug: string): boolean {
    // Check for null, undefined, or non-string types
    if (!slug || typeof slug !== 'string') {
        return false;
    }

    // Reject empty strings or strings that are only whitespace
    const trimmedSlug = slug.trim();
    if (trimmedSlug.length === 0) {
        return false;
    }

    // Check for path traversal attempts
    if (slug.includes('..')) {
        return false;
    }

    // Reject slugs that start with a slash (absolute path attempt)
    if (slug.startsWith('/')) {
        return false;
    }

    // Reject slugs containing backslashes (Windows path separator)
    if (slug.includes('\\')) {
        return false;
    }

    // Reject slugs containing null bytes (potential injection)
    if (slug.includes('\0')) {
        return false;
    }

    return true;
}

/**
 * Generates the frontend URL for a category page.
 *
 * @param category - The WordPress category object containing at minimum a slug
 * @returns The frontend URL path for the category (e.g., "/blog/category/web-design")
 *          Returns "/blog" if the category is invalid or missing a slug
 *
 * @example
 * const category = { slug: 'web-design', name: 'Web Design' };
 * getCategoryUrl(category); // Returns: "/blog/category/web-design"
 *
 * @example
 * // With special characters (properly encoded)
 * const category = { slug: 'c++' };
 * getCategoryUrl(category); // Returns: "/blog/category/c%2B%2B"
 */
export function getCategoryUrl(category: WpCategory): string {
    if (!category?.slug || !isValidSlug(category.slug)) {
        console.warn('getCategoryUrl: Invalid or missing slug');
        return '/blog';
    }
    return `/blog/category/${encodeURIComponent(category.slug)}`;
}

/**
 * Generates the frontend URL for an author page.
 *
 * @param author - The WordPress author object containing at minimum a slug
 * @returns The frontend URL path for the author (e.g., "/blog/author/john-doe")
 *          Returns "/blog" if the author is invalid or missing a slug
 *
 * @example
 * const author = { slug: 'john-doe', name: 'John Doe' };
 * getAuthorUrl(author); // Returns: "/blog/author/john-doe"
 */
export function getAuthorUrl(author: WpAuthor): string {
    if (!author?.slug || !isValidSlug(author.slug)) {
        console.warn('getAuthorUrl: Invalid or missing slug');
        return '/blog';
    }
    return `/blog/author/${encodeURIComponent(author.slug)}`;
}

/**
 * Generates the frontend URL for a blog post.
 *
 * @param post - The WordPress post object containing at minimum a slug
 * @returns The frontend URL path for the post (e.g., "/blog/my-awesome-post")
 *          Returns "/blog" if the post is invalid or missing a slug
 *
 * @example
 * const post = { slug: 'my-awesome-post', title: { rendered: 'My Awesome Post' } };
 * getPostUrl(post); // Returns: "/blog/my-awesome-post"
 */
export function getPostUrl(post: WpPost): string {
    if (!post?.slug || !isValidSlug(post.slug)) {
        console.warn('getPostUrl: Invalid or missing slug');
        return '/blog';
    }
    return `/blog/${encodeURIComponent(post.slug)}`;
}

/**
 * Generates the frontend URL for a tag page.
 *
 * @param tag - The WordPress tag object containing at minimum a slug
 * @returns The frontend URL path for the tag (e.g., "/blog/tag/javascript")
 *          Returns "/blog" if the tag is invalid or missing a slug
 *
 * @example
 * const tag = { slug: 'javascript', name: 'JavaScript' };
 * getTagUrl(tag); // Returns: "/blog/tag/javascript"
 */
export function getTagUrl(tag: WpTag): string {
    if (!tag?.slug || !isValidSlug(tag.slug)) {
        console.warn('getTagUrl: Invalid or missing slug');
        return '/blog';
    }
    return `/blog/tag/${encodeURIComponent(tag.slug)}`;
}

/**
 * Extracts a slug from a WordPress backend URL.
 * Useful when you only have the full WordPress URL and need the slug.
 *
 * @param wpUrl - The full WordPress URL (e.g., "https://wordpress.example.com/category/web-design/")
 * @returns The extracted slug or null if extraction fails
 *
 * @example
 * extractSlugFromUrl('https://wp.example.com/category/web-design/'); // Returns: "web-design"
 * extractSlugFromUrl('https://wp.example.com/author/john-doe/'); // Returns: "john-doe"
 * extractSlugFromUrl(''); // Returns: null
 */
export function extractSlugFromUrl(wpUrl: string): string | null {
    if (!wpUrl || typeof wpUrl !== 'string') {
        return null;
    }

    try {
        const url = new URL(wpUrl);
        // Remove trailing slash and get the last path segment
        const pathSegments = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
        const slug = pathSegments[pathSegments.length - 1] || null;

        // Validate the extracted slug before returning
        if (slug && !isValidSlug(slug)) {
            console.warn('extractSlugFromUrl: Extracted slug failed validation');
            return null;
        }

        return slug;
    } catch {
        // If URL parsing fails, try a simple regex approach
        const match = wpUrl.match(/\/([^/]+)\/?$/);
        const slug = match ? match[1] : null;

        // Validate the extracted slug before returning
        if (slug && !isValidSlug(slug)) {
            console.warn('extractSlugFromUrl: Extracted slug failed validation');
            return null;
        }

        return slug;
    }
}

// Re-export types for convenience
export type { WpAuthor, WpCategory, WpPost, WpTag } from './types';
