// lib/theme-functions.ts

import { ReactNode } from 'react';
import Text from '@/components/blocks/Text/Text';

interface WpAuthor {
    name: string;
    description: string;
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

interface WpPost {
    title: {
        rendered: string
    },
    excerpt?: {
        rendered: string
    },
    date: string,
    modified: string,
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

export function getTitle(post: WpPost): ReactNode {
    const title = post.title.rendered;

    return title;
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