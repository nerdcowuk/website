// lib/theme-functions.ts

import { ReactNode } from 'react';
import Text from '@/components/blocks/Text/Text';

interface WpAuthor {
    name: string;
    description: string;
    link: string;
    avatar_urls: {
        [key: number]: string;
    };
}

interface WpTerm {
    id: number;
    name: string;
    link: string;
    taxonomy: string;
}

interface ContentImage {
    id: number | null;
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
    srcset: string | null;
    sizes: string | null;
    caption: string | null;
}

interface WpPost {
    title: {
        rendered: string
    },
    excerpt?: {
        rendered: string
    },
    slug: string,
    date: string,
    modified: string,
    estimatedReadingTime?: number,
    contentImages?: ContentImage[],
    _embedded?: {
        author?: WpAuthor[],
        'wp:term'?: WpTerm[][];
    };
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

export function getTitle(post: WpPost): string {
    return post.title.rendered;
}

export function getExcerpt(post: WpPost): string {
    const excerpt = post.excerpt?.rendered || '';
    
    // Strip HTML tags
    const stripped = excerpt.replace(/<[^>]*>/g, '').trim();
    
    // Decode HTML entities
    const decoded = stripped
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    
    return decoded;
}

export function getAuthor(post: WpPost): WpAuthor | null {
    const author = post._embedded?.author;

    if(!author) {
        return null;
    }

    return author[0] as WpAuthor;
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

export function getAuthorName(post: WpPost): string {
    return post._embedded?.author?.[0]?.name ?? '';
}

export function getAuthorUrl(post: WpPost): string {
    return post._embedded?.author?.[0]?.link ?? '';
}

export function getContentImages(post: WpPost): ContentImage[] {
    return post.contentImages ?? [];
}