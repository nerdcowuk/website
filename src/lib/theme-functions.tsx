// lib/theme-functions.ts
/**
 * Theme utility functions for working with WordPress post data.
 * Provides helpers for extracting and formatting common post fields.
 *
 * @module lib/theme-functions
 */

import { ReactNode } from 'react';
import { decode } from 'he';
import Text from '@/components/primitives/Text';
import type { WpPost, WpAuthor, WpTerm, ContentImage } from '@/types';

/**
 * Decodes HTML entities in a string using the 'he' library.
 * Handles named entities (&amp;), decimal entities (&#8217;), and hex entities (&#x27;).
 *
 * @param text - The text containing HTML entities to decode
 * @returns The decoded string, or empty string if input is null/undefined
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
    if (!text) {
        return '';
    }
    return decode(text);
}

export function getDate(post: WpPost): ReactNode {
    const date = post?.date;

    if(!date) {
        return '';
    }

    return (
        <Text as="time">
            {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })} 
        </Text>
    )
}

export function getCategories(post: WpPost): ReactNode {
    const embeddedTerms = post._embedded?.['wp:term'];
    
    if (!embeddedTerms) {
        return <Text>Uncategorized</Text>;
    }

    const categories = embeddedTerms
        .flat()
        .filter((term): term is WpTerm => term.taxonomy === 'category')
        .sort((a, b) => a.name.localeCompare(b.name));

    if (categories.length === 0) {
        return <Text>Uncategorized</Text>;
    }

    return (
        <>
            {categories.map((category, index) => (
                <Text as="span" key={category.id}>
                    <Text as="a" href={category.link}>
                        {category.name}
                    </Text>
                    {index < categories.length - 1 && <Text as="span">, </Text>}
                </Text>
            ))}
        </>
    );
}

/**
 * Extracts and decodes the post title.
 *
 * @param post - The WordPress post object
 * @returns The decoded title string, or empty string if title is missing
 */
export function getTitle(post: WpPost): string {
    if (!post?.title?.rendered) {
        return '';
    }
    return decodeHtmlEntities(post.title.rendered);
}

/**
 * Extracts and processes the post excerpt.
 * Strips HTML tags and decodes HTML entities.
 *
 * @param post - The WordPress post object
 * @returns The processed excerpt string, or empty string if excerpt is missing
 */
export function getExcerpt(post: WpPost): string {
    const excerpt = post.excerpt?.rendered || '';

    // Strip HTML tags
    const stripped = excerpt.replace(/<[^>]*>/g, '').trim();

    // Decode HTML entities using the 'he' library
    return decodeHtmlEntities(stripped);
}

/**
 * Extracts the first author from a post's embedded data.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The first author object, or null if no author is available
 */
export function getAuthor(post: WpPost): WpAuthor | null {
    const author = post._embedded?.author;

    // Return null if no embedded data, no author array, or empty array
    if (!author || author.length === 0) {
        return null;
    }

    return author[0];
}

export function getModifiedDate(post: WpPost): string {
    const modified = post?.modified;

    if(!modified) {
        return '';
    }

    return new Date(modified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function getReadTime(post: WpPost): number | null {
    return post.estimatedReadingTime ?? null;
}

export function getSlug(post: WpPost): string {
    return post.slug ?? '';
}

export function getDateString(post: WpPost): string {
    if (!post?.date) return '';
    return new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Extracts the author name from a post's embedded data.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The author's display name, or empty string if not available
 */
export function getAuthorName(post: WpPost): string {
    return post._embedded?.author?.[0]?.name ?? '';
}

/**
 * Extracts the author slug from a post's embedded data.
 * Falls back to extracting the slug from the author's link URL if slug is not directly available.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The author's URL slug, or empty string if not available
 */
export function getAuthorSlug(post: WpPost): string {
    const author = post._embedded?.author?.[0];
    if (!author) {
        return '';
    }

    // Prefer direct slug if available
    if (author.slug) {
        return author.slug;
    }

    // Fall back to extracting slug from link URL
    // WordPress author links typically follow the pattern: https://example.com/author/{slug}/
    if (author.link) {
        const match = author.link.match(/\/author\/([^/]+)\/?$/);
        if (match) {
            return match[1];
        }
    }

    return '';
}

/**
 * Generates the internal author URL for use in the frontend.
 * Uses the author slug to create a URL in the format /blog/author/{slug}.
 *
 * @param post - The WordPress post object with embedded author data
 * @returns The internal author URL, or empty string if slug is not available
 */
export function getAuthorUrl(post: WpPost): string {
    const slug = getAuthorSlug(post);
    if (!slug) {
        return '';
    }
    return `/blog/author/${slug}`;
}

export function getContentImages(post: WpPost): ContentImage[] {
    return post.contentImages ?? [];
}