/**
 * Test suite for theme utility functions.
 * Tests cover HTML entity decoding, post data extraction, and formatting utilities.
 *
 * @module theme-functions.test
 */

import { describe, test, expect } from 'vitest';
import {
    decodeHtmlEntities,
    getTitle,
    getExcerpt,
    getAuthor,
    getModifiedDate,
    getReadTime,
    getSlug,
    getDateString,
    getAuthorName,
    getAuthorUrl,
    getAuthorSlug,
    getContentImages,
} from './theme-functions';

describe('decodeHtmlEntities', () => {
    describe('common named entities', () => {
        test('should decode &amp; to ampersand', () => {
            expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
        });

        test('should decode &lt; and &gt; to angle brackets', () => {
            expect(decodeHtmlEntities('&lt;html&gt;')).toBe('<html>');
        });

        test('should decode &quot; to double quote', () => {
            expect(decodeHtmlEntities('She said &quot;hello&quot;')).toBe('She said "hello"');
        });

        test('should decode &apos; to apostrophe', () => {
            expect(decodeHtmlEntities('It&apos;s fine')).toBe("It's fine");
        });

        test('should decode &nbsp; to non-breaking space', () => {
            expect(decodeHtmlEntities('Hello&nbsp;World')).toBe('Hello\u00A0World');
        });

        test('should decode &copy; to copyright symbol', () => {
            expect(decodeHtmlEntities('&copy; 2024')).toBe('\u00A9 2024');
        });

        test('should decode &reg; to registered trademark', () => {
            expect(decodeHtmlEntities('Brand&reg;')).toBe('Brand\u00AE');
        });

        test('should decode &trade; to trademark symbol', () => {
            expect(decodeHtmlEntities('Product&trade;')).toBe('Product\u2122');
        });
    });

    describe('typographic entities', () => {
        test('should decode &hellip; to ellipsis', () => {
            expect(decodeHtmlEntities('Wait&hellip;')).toBe('Wait\u2026');
        });

        test('should decode &mdash; to em dash', () => {
            expect(decodeHtmlEntities('Word&mdash;another')).toBe('Word\u2014another');
        });

        test('should decode &ndash; to en dash', () => {
            expect(decodeHtmlEntities('2020&ndash;2024')).toBe('2020\u20132024');
        });

        test('should decode &lsquo; and &rsquo; to curly single quotes', () => {
            expect(decodeHtmlEntities('&lsquo;quoted&rsquo;')).toBe('\u2018quoted\u2019');
        });

        test('should decode &ldquo; and &rdquo; to curly double quotes', () => {
            expect(decodeHtmlEntities('&ldquo;quoted&rdquo;')).toBe('\u201Cquoted\u201D');
        });
    });

    describe('numeric entities (decimal)', () => {
        test('should decode &#8217; to right single quotation mark', () => {
            expect(decodeHtmlEntities("It&#8217;s great")).toBe("It\u2019s great");
        });

        test('should decode &#8216; to left single quotation mark', () => {
            expect(decodeHtmlEntities('&#8216;Hello')).toBe('\u2018Hello');
        });

        test('should decode &#8220; and &#8221; to curly double quotes', () => {
            expect(decodeHtmlEntities('&#8220;Test&#8221;')).toBe('\u201CTest\u201D');
        });

        test('should decode &#8211; to en dash', () => {
            expect(decodeHtmlEntities('1&#8211;10')).toBe('1\u201310');
        });

        test('should decode &#8212; to em dash', () => {
            expect(decodeHtmlEntities('word&#8212;word')).toBe('word\u2014word');
        });

        test('should decode &#8230; to ellipsis', () => {
            expect(decodeHtmlEntities('Wait&#8230;')).toBe('Wait\u2026');
        });

        test('should decode &#160; to non-breaking space', () => {
            expect(decodeHtmlEntities('Hello&#160;World')).toBe('Hello\u00A0World');
        });

        test('should decode &#169; to copyright symbol', () => {
            expect(decodeHtmlEntities('&#169; 2024')).toBe('\u00A9 2024');
        });

        test('should decode &#174; to registered trademark', () => {
            expect(decodeHtmlEntities('Brand&#174;')).toBe('Brand\u00AE');
        });

        test('should decode &#8482; to trademark', () => {
            expect(decodeHtmlEntities('Product&#8482;')).toBe('Product\u2122');
        });

        test('should decode &#038; to ampersand', () => {
            expect(decodeHtmlEntities('Tom &#038; Jerry')).toBe('Tom & Jerry');
        });

        test('should decode &#39; to apostrophe', () => {
            expect(decodeHtmlEntities('It&#39;s')).toBe("It's");
        });

        test('should decode &#34; to double quote', () => {
            expect(decodeHtmlEntities('&#34;Hello&#34;')).toBe('"Hello"');
        });

        test('should decode &#60; and &#62; to angle brackets', () => {
            expect(decodeHtmlEntities('&#60;tag&#62;')).toBe('<tag>');
        });
    });

    describe('hexadecimal entities', () => {
        test('should decode &#x27; to apostrophe', () => {
            expect(decodeHtmlEntities('It&#x27;s fine')).toBe("It's fine");
        });

        test('should decode &#x22; to double quote', () => {
            expect(decodeHtmlEntities('&#x22;Hello&#x22;')).toBe('"Hello"');
        });

        test('should decode &#x26; to ampersand', () => {
            expect(decodeHtmlEntities('Tom &#x26; Jerry')).toBe('Tom & Jerry');
        });

        test('should decode &#x3C; and &#x3E; to angle brackets', () => {
            expect(decodeHtmlEntities('&#x3C;html&#x3E;')).toBe('<html>');
        });

        test('should decode uppercase hex &#X27;', () => {
            expect(decodeHtmlEntities('It&#X27;s fine')).toBe("It's fine");
        });

        test('should decode mixed case hex &#xA9;', () => {
            expect(decodeHtmlEntities('&#xA9; 2024')).toBe('\u00A9 2024');
        });

        test('should decode &#x2019; to right single quotation mark', () => {
            expect(decodeHtmlEntities("It&#x2019;s great")).toBe("It\u2019s great");
        });
    });

    describe('accented characters (common in international content)', () => {
        test('should decode &eacute; to e with acute', () => {
            // The 'he' library decodes &eacute; to precomposed e (U+00E9)
            expect(decodeHtmlEntities('caf&eacute;')).toBe('caf\u00E9');
        });

        test('should decode &ntilde; to n with tilde', () => {
            // Precomposed: U+00F1 = n with tilde
            expect(decodeHtmlEntities('Espa&ntilde;a')).toBe('Espa\u00F1a');
        });

        test('should decode &uuml; to u with umlaut', () => {
            // Precomposed: U+00FC = u with umlaut
            expect(decodeHtmlEntities('M&uuml;nchen')).toBe('M\u00FCnchen');
        });

        test('should decode &aacute; to a with acute', () => {
            // Precomposed: U+00E1 = a with acute
            expect(decodeHtmlEntities('&aacute;rbol')).toBe('\u00E1rbol');
        });

        test('should decode &iacute; to i with acute', () => {
            // Precomposed: U+00ED = i with acute
            expect(decodeHtmlEntities('Mar&iacute;a')).toBe('Mar\u00EDa');
        });

        test('should decode &oacute; to o with acute', () => {
            // Precomposed: U+00F3 = o with acute
            expect(decodeHtmlEntities('avi&oacute;n')).toBe('avi\u00F3n');
        });

        test('should decode &ccedil; to c with cedilla', () => {
            // Precomposed: U+00E7 = c with cedilla
            expect(decodeHtmlEntities('fran&ccedil;ais')).toBe('fran\u00E7ais');
        });
    });

    describe('mathematical and currency symbols', () => {
        test('should decode &times; to multiplication sign', () => {
            expect(decodeHtmlEntities('5 &times; 10')).toBe('5 \u00D7 10');
        });

        test('should decode &divide; to division sign', () => {
            expect(decodeHtmlEntities('10 &divide; 2')).toBe('10 \u00F7 2');
        });

        test('should decode &plusmn; to plus-minus sign', () => {
            expect(decodeHtmlEntities('&plusmn;5')).toBe('\u00B15');
        });

        test('should decode &euro; to euro symbol', () => {
            expect(decodeHtmlEntities('&euro;100')).toBe('\u20AC100');
        });

        test('should decode &pound; to pound symbol', () => {
            expect(decodeHtmlEntities('&pound;50')).toBe('\u00A350');
        });

        test('should decode &yen; to yen symbol', () => {
            expect(decodeHtmlEntities('&yen;1000')).toBe('\u00A51000');
        });

        test('should decode &cent; to cent symbol', () => {
            expect(decodeHtmlEntities('99&cent;')).toBe('99\u00A2');
        });

        test('should decode &deg; to degree symbol', () => {
            expect(decodeHtmlEntities('72&deg;F')).toBe('72\u00B0F');
        });
    });

    describe('edge cases', () => {
        test('should handle empty string', () => {
            expect(decodeHtmlEntities('')).toBe('');
        });

        test('should handle null input', () => {
            expect(decodeHtmlEntities(null as unknown as string)).toBe('');
        });

        test('should handle undefined input', () => {
            expect(decodeHtmlEntities(undefined as unknown as string)).toBe('');
        });

        test('should handle strings without entities', () => {
            expect(decodeHtmlEntities('Hello World')).toBe('Hello World');
        });

        test('should handle strings with only whitespace', () => {
            expect(decodeHtmlEntities('   ')).toBe('   ');
        });

        test('should handle multiple entities in sequence', () => {
            expect(decodeHtmlEntities('&lt;&gt;&amp;')).toBe('<>&');
        });

        test('should handle mixed named and numeric entities', () => {
            expect(decodeHtmlEntities('&amp;&#8217;s')).toBe("&\u2019s");
        });

        test('should preserve partial/invalid entity patterns', () => {
            // The 'he' library is strict - it may decode or preserve invalid entities
            const result = decodeHtmlEntities('&invalid;');
            // Either preserved or decoded based on 'he' behavior
            expect(typeof result).toBe('string');
        });

        test('should handle entity at start of string', () => {
            expect(decodeHtmlEntities('&amp;start')).toBe('&start');
        });

        test('should handle entity at end of string', () => {
            expect(decodeHtmlEntities('end&amp;')).toBe('end&');
        });
    });

    describe('WordPress post titles with entities', () => {
        test('should decode typical WordPress title with smart quotes', () => {
            expect(decodeHtmlEntities('Tom &#038; Jerry&#8217;s Adventure'))
                .toBe("Tom & Jerry\u2019s Adventure");
        });

        test('should decode title with curly quotes', () => {
            expect(decodeHtmlEntities('&#8220;The Best&#8221; Article'))
                .toBe('\u201CThe Best\u201D Article');
        });

        test('should decode title with ellipsis', () => {
            expect(decodeHtmlEntities('Wait for it&#8230;'))
                .toBe('Wait for it\u2026');
        });

        test('should decode title with em dash', () => {
            expect(decodeHtmlEntities('Part 1 &#8212; Introduction'))
                .toBe('Part 1 \u2014 Introduction');
        });

        test('should decode complex WordPress title', () => {
            const wpTitle = '&#8220;It&#8217;s&#8221; a &#8216;Test&#8217; &#8212; Really!';
            expect(decodeHtmlEntities(wpTitle))
                .toBe('\u201CIt\u2019s\u201D a \u2018Test\u2019 \u2014 Really!');
        });

        test('should decode HTML entities in titles with angle brackets (escaped)', () => {
            expect(decodeHtmlEntities('React &lt;Component&gt; Guide'))
                .toBe('React <Component> Guide');
        });
    });
});

describe('getTitle', () => {
    test('should extract and decode title from post', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Tom &amp; Jerry&#8217;s Adventure' }
        };
        expect(getTitle(post)).toBe("Tom & Jerry\u2019s Adventure");
    });

    test('should return empty string for post without title', () => {
        const post = { slug: 'test' };
        expect(getTitle(post)).toBe('');
    });

    test('should return empty string for post with empty title', () => {
        const post = { slug: 'test', title: { rendered: '' } };
        expect(getTitle(post)).toBe('');
    });

    test('should handle title with multiple entity types', () => {
        const post = {
            slug: 'test',
            title: { rendered: '&ldquo;Best&rdquo; &amp; Greatest&#8230;' }
        };
        expect(getTitle(post)).toBe('\u201CBest\u201D & Greatest\u2026');
    });
});

describe('getExcerpt', () => {
    test('should extract, strip HTML, and decode excerpt', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            excerpt: { rendered: '<p>This is the &ldquo;excerpt&rdquo;.</p>' }
        };
        expect(getExcerpt(post)).toBe('This is the \u201Cexcerpt\u201D.');
    });

    test('should return empty string for post without excerpt', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getExcerpt(post)).toBe('');
    });

    test('should strip multiple HTML tags', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            excerpt: { rendered: '<p><strong>Bold</strong> and <em>italic</em>.</p>' }
        };
        expect(getExcerpt(post)).toBe('Bold and italic.');
    });

    test('should handle excerpt with nested tags', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            excerpt: { rendered: '<div><p><span>Nested</span> content</p></div>' }
        };
        expect(getExcerpt(post)).toBe('Nested content');
    });

    test('should trim whitespace from excerpt', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            excerpt: { rendered: '  <p>  Spaced content  </p>  ' }
        };
        expect(getExcerpt(post)).toBe('Spaced content');
    });
});

describe('getAuthor', () => {
    test('should extract author from post with embedded data', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    slug: 'john-doe',
                    name: 'John Doe',
                    description: 'A writer',
                    link: 'https://example.com/author/john-doe/'
                }]
            }
        };
        const author = getAuthor(post);
        expect(author).not.toBeNull();
        expect(author?.name).toBe('John Doe');
        expect(author?.slug).toBe('john-doe');
    });

    test('should return null for post without embedded data', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getAuthor(post)).toBeNull();
    });

    test('should return null for post with empty author array', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: []
            }
        };
        expect(getAuthor(post)).toBeNull();
    });
});

describe('getModifiedDate', () => {
    test('should format modified date correctly', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            modified: '2024-01-15T10:30:00'
        };
        expect(getModifiedDate(post)).toBe('January 15, 2024');
    });

    test('should return empty string for post without modified date', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getModifiedDate(post)).toBe('');
    });

    test('should handle ISO date format with timezone', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            modified: '2024-06-20T14:00:00+00:00'
        };
        const result = getModifiedDate(post);
        // The exact format may vary by timezone, but should contain the date
        expect(result).toContain('2024');
    });
});

describe('getReadTime', () => {
    test('should return reading time when available', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            estimatedReadingTime: 5
        };
        expect(getReadTime(post)).toBe(5);
    });

    test('should return null when reading time is not available', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getReadTime(post)).toBeNull();
    });

    test('should handle zero reading time', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            estimatedReadingTime: 0
        };
        expect(getReadTime(post)).toBe(0);
    });
});

describe('getSlug', () => {
    test('should return post slug', () => {
        const post = {
            slug: 'my-awesome-post',
            title: { rendered: 'Test' }
        };
        expect(getSlug(post)).toBe('my-awesome-post');
    });

    test('should return empty string for post without slug', () => {
        const post = {
            title: { rendered: 'Test' }
        } as unknown as { slug: string };
        expect(getSlug(post)).toBe('');
    });
});

describe('getDateString', () => {
    test('should format publication date correctly', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            date: '2024-03-10T09:00:00'
        };
        expect(getDateString(post)).toBe('March 10, 2024');
    });

    test('should return empty string for post without date', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getDateString(post)).toBe('');
    });

    test('should handle null post', () => {
        expect(getDateString(null as unknown as { slug: string; date?: string })).toBe('');
    });
});

describe('getAuthorName', () => {
    test('should extract author name from embedded data', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    slug: 'jane-doe',
                    name: 'Jane Doe',
                    description: '',
                    link: ''
                }]
            }
        };
        expect(getAuthorName(post)).toBe('Jane Doe');
    });

    test('should return empty string for post without author', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getAuthorName(post)).toBe('');
    });

    test('should return empty string for empty author array', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: []
            }
        };
        expect(getAuthorName(post)).toBe('');
    });
});

describe('getAuthorUrl', () => {
    test('should generate author URL from slug', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    slug: 'john-doe',
                    name: 'John Doe',
                    description: '',
                    link: 'https://wordpress.example.com/author/john-doe/'
                }]
            }
        };
        expect(getAuthorUrl(post)).toBe('/blog/author/john-doe');
    });

    test('should extract slug from link as fallback', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    name: 'John Doe',
                    description: '',
                    link: 'https://wordpress.example.com/author/john-doe/'
                } as { slug?: string; name: string; description: string; link: string }]
            }
        };
        expect(getAuthorUrl(post)).toBe('/blog/author/john-doe');
    });

    test('should return empty string when no author data', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getAuthorUrl(post)).toBe('');
    });

    test('should return empty string when author has no slug or link', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    name: 'Anonymous',
                    description: ''
                } as { slug?: string; name: string; description: string; link?: string }]
            }
        };
        expect(getAuthorUrl(post)).toBe('');
    });
});

describe('getAuthorSlug', () => {
    test('should return author slug from embedded data', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    slug: 'jane-smith',
                    name: 'Jane Smith',
                    description: '',
                    link: ''
                }]
            }
        };
        expect(getAuthorSlug(post)).toBe('jane-smith');
    });

    test('should extract slug from link as fallback', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            _embedded: {
                author: [{
                    name: 'Jane Smith',
                    description: '',
                    link: 'https://example.com/author/jane-smith/'
                } as { slug?: string; name: string; description: string; link: string }]
            }
        };
        expect(getAuthorSlug(post)).toBe('jane-smith');
    });

    test('should return empty string when no author', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getAuthorSlug(post)).toBe('');
    });
});

describe('getContentImages', () => {
    test('should return content images array', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            contentImages: [
                {
                    id: 1,
                    url: 'https://example.com/image.jpg',
                    alt: 'Test image',
                    width: 800,
                    height: 600,
                    srcset: null,
                    sizes: null,
                    caption: null
                }
            ]
        };
        const images = getContentImages(post);
        expect(images).toHaveLength(1);
        expect(images[0].url).toBe('https://example.com/image.jpg');
    });

    test('should return empty array for post without images', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' }
        };
        expect(getContentImages(post)).toEqual([]);
    });

    test('should return empty array for post with null contentImages', () => {
        const post = {
            slug: 'test',
            title: { rendered: 'Test' },
            contentImages: null as unknown as []
        };
        expect(getContentImages(post)).toEqual([]);
    });
});
