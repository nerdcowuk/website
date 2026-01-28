/**
 * Pure data extraction functions for WordPress post data.
 *
 * These functions extract and transform data from WordPress posts/pages
 * into plain JavaScript values. They do NOT return React components -
 * use these in server components, data processing, or when you need
 * the raw data for further transformation.
 *
 * @module wordpress/data
 */

import { decode } from 'he';
import type { WpPost, WpPage, WpAuthor, WpTerm, ContentImage, DateFormatOptions } from '@/types';

// =============================================================================
// HTML ENTITY UTILITIES
// =============================================================================

/**
 * Decodes HTML entities in a string to their corresponding characters.
 * Uses the 'he' library for comprehensive HTML entity support, handling
 * all named entities, numeric entities, and hexadecimal entities.
 *
 * @param text - The string containing HTML entities to decode
 * @returns The decoded string with all HTML entities converted to their character equivalents.
 *          Returns an empty string if the input is null, undefined, or empty.
 *
 * @example
 * decodeHtmlEntities('Tom &amp; Jerry'); // Returns: "Tom & Jerry"
 * decodeHtmlEntities('It&#8217;s great!'); // Returns: "It's great!"
 * decodeHtmlEntities('Caf&eacute;'); // Returns: "Cafe"
 * decodeHtmlEntities('5 &times; 10 = 50'); // Returns: "5 x 10 = 50"
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
    if (!text) {
        return '';
    }
    return decode(text);
}

// =============================================================================
// DATE FUNCTIONS
// =============================================================================

/**
 * Gets the formatted publication date of a post as a string.
 *
 * @param post - The WordPress post object
 * @param options - Formatting options
 * @returns The formatted date string, or null if no date available
 *
 * @example
 * getFormattedDate(post); // Returns: "January 15, 2024"
 * getFormattedDate(post, { format: 'short' }); // Returns: "Jan 15, 2024"
 * getFormattedDate(post, { format: 'numeric' }); // Returns: "1/15/2024"
 */
export function getFormattedDate(
    post: WpPost | WpPage,
    options: DateFormatOptions = {}
): string | null {
    const date = post?.date;
    if (!date) {
        return null;
    }

    const { format = 'long', locale = 'en-US', includeYear = true } = options;

    const dateObj = new Date(date);

    const formatOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
    };

    switch (format) {
        case 'short':
            formatOptions.month = 'short';
            break;
        case 'numeric':
            formatOptions.month = 'numeric';
            break;
        case 'long':
        default:
            formatOptions.month = 'long';
            break;
    }

    if (includeYear) {
        formatOptions.year = 'numeric';
    }

    return dateObj.toLocaleDateString(locale, formatOptions);
}

/**
 * Gets the publication date in ISO 8601 format.
 * Useful for datetime attributes on <time> elements.
 *
 * @param post - The WordPress post object
 * @returns The ISO date string, or null if no date available
 *
 * @example
 * getIsoDate(post); // Returns: "2024-01-15T10:30:00"
 */
export function getIsoDate(post: WpPost | WpPage): string | null {
    return post?.date ?? null;
}

/**
 * Gets the formatted modified date of a post as a string.
 *
 * @param post - The WordPress post object
 * @param options - Formatting options
 * @returns The formatted modified date string, or null if not available
 *
 * @example
 * getFormattedModifiedDate(post); // Returns: "January 20, 2024"
 */
export function getFormattedModifiedDate(
    post: WpPost | WpPage,
    options: DateFormatOptions = {}
): string | null {
    const modified = post?.modified;
    if (!modified) {
        return null;
    }

    const { format = 'long', locale = 'en-US', includeYear = true } = options;

    const dateObj = new Date(modified);

    const formatOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
    };

    switch (format) {
        case 'short':
            formatOptions.month = 'short';
            break;
        case 'numeric':
            formatOptions.month = 'numeric';
            break;
        case 'long':
        default:
            formatOptions.month = 'long';
            break;
    }

    if (includeYear) {
        formatOptions.year = 'numeric';
    }

    return dateObj.toLocaleDateString(locale, formatOptions);
}

// =============================================================================
// TITLE AND CONTENT FUNCTIONS
// =============================================================================

/**
 * Extracts and decodes the title from a WordPress post/page object.
 *
 * @param post - The WordPress post/page object
 * @returns The decoded title string with HTML entities converted to characters.
 *          Returns empty string if title is not available.
 *
 * @example
 * const post = { title: { rendered: 'Tom &amp; Jerry&#8217;s Adventure' } };
 * getTitle(post); // Returns: "Tom & Jerry's Adventure"
 */
export function getTitle(post: WpPost | WpPage): string {
    if (!post?.title?.rendered) {
        return '';
    }
    return decodeHtmlEntities(post.title.rendered);
}

/**
 * Extracts and decodes the excerpt from a WordPress post object.
 * Strips HTML tags and decodes HTML entities.
 *
 * @param post - The WordPress post object
 * @param maxLength - Optional maximum length (will truncate with ellipsis if exceeded)
 * @returns The decoded and stripped excerpt string
 *
 * @example
 * const post = { excerpt: { rendered: '<p>This is the &ldquo;excerpt&rdquo;.</p>' } };
 * getExcerpt(post); // Returns: 'This is the "excerpt".'
 * getExcerpt(post, 10); // Returns: 'This is...'
 */
export function getExcerpt(post: WpPost, maxLength?: number): string {
    const excerpt = post?.excerpt?.rendered || '';

    // Strip HTML tags
    const stripped = excerpt.replace(/<[^>]*>/g, '').trim();

    // Decode HTML entities
    let decoded = decodeHtmlEntities(stripped);

    // Truncate if maxLength is specified
    if (maxLength && decoded.length > maxLength) {
        decoded = decoded.substring(0, maxLength).trim() + '...';
    }

    return decoded;
}

/**
 * Returns the slug of a post/page.
 *
 * @param post - The WordPress post/page object
 * @returns The slug or empty string if not available
 */
export function getSlug(post: WpPost | WpPage): string {
    return post?.slug ?? '';
}

// =============================================================================
// AUTHOR FUNCTIONS
// =============================================================================

/**
 * Extracts the author object from a WordPress post.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The author object or null if not available
 */
export function getAuthor(post: WpPost): WpAuthor | null {
    const author = post?._embedded?.author;

    if (!author || author.length === 0) {
        return null;
    }

    return author[0];
}

/**
 * Returns the display name of the post author.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The author's display name or empty string if not available
 */
export function getAuthorName(post: WpPost): string {
    const author = getAuthor(post);
    return author?.name ?? '';
}

/**
 * Returns the author's avatar URL at the specified size.
 *
 * @param post - The WordPress post object with embedded author data
 * @param size - The avatar size in pixels (default: 96)
 * @returns The avatar URL or empty string if not available
 *
 * @example
 * getAuthorAvatarUrl(post, 48); // Returns avatar URL at 48px
 */
export function getAuthorAvatarUrl(post: WpPost, size: number = 96): string {
    const author = getAuthor(post);
    if (!author?.avatar_urls) {
        return '';
    }

    // Try to get exact size, or fall back to closest available
    if (author.avatar_urls[size]) {
        return author.avatar_urls[size];
    }

    // Fall back to any available size
    const availableSizes = Object.keys(author.avatar_urls)
        .map(Number)
        .sort((a, b) => a - b);

    if (availableSizes.length > 0) {
        // Find the closest size that's >= requested, or the largest available
        const closestSize = availableSizes.find(s => s >= size) || availableSizes[availableSizes.length - 1];
        return author.avatar_urls[closestSize] || '';
    }

    return '';
}

/**
 * Returns the author's slug from a post's embedded data.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The author's slug or empty string if not available
 */
export function getAuthorSlug(post: WpPost): string {
    const author = getAuthor(post);

    if (author?.slug) {
        return author.slug;
    }

    // Fallback: try to extract slug from the WordPress link
    if (author?.link) {
        const slugMatch = author.link.match(/\/author\/([^/]+)\/?$/);
        if (slugMatch) {
            return slugMatch[1];
        }
    }

    return '';
}

// =============================================================================
// TAXONOMY FUNCTIONS
// =============================================================================

/**
 * Extracts all categories from a post's embedded term data.
 *
 * @param post - The WordPress post object with embedded term data
 * @returns Array of category term objects, sorted alphabetically by name
 */
export function getCategories(post: WpPost): WpTerm[] {
    const embeddedTerms = post?._embedded?.['wp:term'];

    if (!embeddedTerms) {
        return [];
    }

    return embeddedTerms
        .flat()
        .filter((term): term is WpTerm => term?.taxonomy === 'category')
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns an array of category names from a post.
 *
 * @param post - The WordPress post object with embedded term data
 * @returns Array of decoded category names
 *
 * @example
 * getCategoryNames(post); // Returns: ["Design", "UX", "Web Development"]
 */
export function getCategoryNames(post: WpPost): string[] {
    return getCategories(post).map(cat => decodeHtmlEntities(cat.name));
}

/**
 * Returns the primary (first) category from a post.
 * Categories are sorted alphabetically, so this returns the first in that order.
 *
 * @param post - The WordPress post object with embedded term data
 * @returns The primary category term, or null if no categories
 */
export function getPrimaryCategory(post: WpPost): WpTerm | null {
    const categories = getCategories(post);
    return categories.length > 0 ? categories[0] : null;
}

/**
 * Extracts all tags from a post's embedded term data.
 *
 * @param post - The WordPress post object with embedded term data
 * @returns Array of tag term objects, sorted alphabetically by name
 */
export function getTags(post: WpPost): WpTerm[] {
    const embeddedTerms = post?._embedded?.['wp:term'];

    if (!embeddedTerms) {
        return [];
    }

    return embeddedTerms
        .flat()
        .filter((term): term is WpTerm => term?.taxonomy === 'post_tag')
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns an array of tag names from a post.
 *
 * @param post - The WordPress post object with embedded term data
 * @returns Array of decoded tag names
 */
export function getTagNames(post: WpPost): string[] {
    return getTags(post).map(tag => decodeHtmlEntities(tag.name));
}

// =============================================================================
// MEDIA FUNCTIONS
// =============================================================================

/**
 * Returns the URL of the featured image at the specified size.
 *
 * @param post - The WordPress post object with embedded featured media
 * @param size - The image size key (default: 'full')
 * @returns The image URL or null if not available
 *
 * @example
 * getFeaturedImageUrl(post); // Returns full-size image URL
 * getFeaturedImageUrl(post, 'medium'); // Returns medium-size image URL
 */
export function getFeaturedImageUrl(
    post: WpPost,
    size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'full'
): string | null {
    const featuredMedia = post?._embedded?.['wp:featuredmedia']?.[0];

    if (!featuredMedia) {
        return null;
    }

    // Try to get the requested size
    const sizeUrl = featuredMedia.media_details?.sizes?.[size]?.source_url;
    if (sizeUrl) {
        return sizeUrl;
    }

    // Fall back to source_url
    return featuredMedia.source_url || null;
}

/**
 * Returns the alt text of the featured image.
 *
 * @param post - The WordPress post object with embedded featured media
 * @returns The alt text or empty string if not available
 */
export function getFeaturedImageAlt(post: WpPost): string {
    const featuredMedia = post?._embedded?.['wp:featuredmedia']?.[0];
    return featuredMedia?.alt_text ?? '';
}

/**
 * Returns the array of images extracted from post content.
 *
 * @param post - The WordPress post object
 * @returns Array of content images or empty array if none
 */
export function getContentImages(post: WpPost): ContentImage[] {
    return post?.contentImages ?? [];
}

/**
 * Returns the first content image from a post.
 * Useful as a fallback when no featured image is set.
 *
 * @param post - The WordPress post object
 * @returns The first content image or null if none
 */
export function getFirstContentImage(post: WpPost): ContentImage | null {
    const images = getContentImages(post);
    return images.length > 0 ? images[0] : null;
}

// =============================================================================
// READING TIME FUNCTIONS
// =============================================================================

/**
 * Returns the estimated reading time for a post in minutes.
 *
 * @param post - The WordPress post object
 * @returns The reading time in minutes or 0 if not available
 */
export function getReadingTime(post: WpPost): number {
    return post?.estimatedReadingTime ?? 0;
}

/**
 * Returns a human-readable reading time string.
 *
 * @param post - The WordPress post object
 * @returns Formatted reading time string (e.g., "5 min read")
 *
 * @example
 * getReadingTimeText(post); // Returns: "5 min read"
 */
export function getReadingTimeText(post: WpPost): string {
    const time = getReadingTime(post);
    if (time === 0) {
        return '';
    }
    return `${time} min read`;
}
