/**
 * Centralized TypeScript type definitions for WordPress data structures.
 * These types represent the shape of data returned by the WordPress REST API
 * in our headless WordPress setup.
 *
 * @module types/wordpress
 */

// =============================================================================
// RENDERED CONTENT FIELDS
// =============================================================================

/**
 * Represents a rendered content field from WordPress.
 * Used for title, content, excerpt, and other HTML-rendered fields.
 */
export interface WpRenderedField {
    /** The rendered HTML content */
    rendered: string;
    /** Whether the content is protected (password-protected posts) */
    protected?: boolean;
}

// =============================================================================
// USER/AUTHOR TYPES
// =============================================================================

/**
 * Represents a WordPress author/user object.
 * Contains author profile information including name, slug, and avatar URLs.
 *
 * Note: The slug field is optional because embedded author data from the
 * WordPress REST API may not always include it. Use the link field to
 * extract the slug as a fallback when needed.
 */
export interface WpAuthor {
    /** The unique identifier for the author */
    id?: number;
    /** URL-friendly version of the author's name (e.g., "john-doe"). May not be present in embedded data. */
    slug?: string;
    /** Display name of the author. Optional for URL generation but required for display. */
    name?: string;
    /** Full WordPress URL to the author's archive page */
    link?: string;
    /** Author biography/description in HTML format */
    description?: string;
    /**
     * Avatar URLs at different sizes.
     * Keys are pixel sizes (e.g., 24, 48, 96), values are URLs.
     */
    avatar_urls?: {
        [key: number]: string;
    };
}

// =============================================================================
// TAXONOMY TYPES
// =============================================================================

/**
 * Represents a WordPress taxonomy term (base type).
 * This is the base type for categories, tags, and custom taxonomies.
 */
export interface WpTerm {
    /** The unique identifier for the term */
    id: number;
    /** Display name of the term */
    name: string;
    /** Full WordPress URL to the term archive page */
    link: string;
    /** URL-friendly version of the term name */
    slug: string;
    /** The taxonomy this term belongs to (e.g., "category", "post_tag") */
    taxonomy: string;
}

/**
 * Represents a WordPress category object.
 * Categories are hierarchical taxonomies used to organize posts.
 */
export interface WpCategory {
    /** The unique identifier for the category */
    id?: number;
    /** URL-friendly version of the category name (e.g., "web-design") */
    slug: string;
    /** Display name of the category */
    name?: string;
    /** Full WordPress URL to the category archive page */
    link?: string;
    /** The parent category ID (0 if top-level) */
    parent?: number;
    /** Number of posts in this category */
    count?: number;
    /** Category description */
    description?: string;
    /** The taxonomy type (always "category" for categories) */
    taxonomy?: string;
}

/**
 * Represents a WordPress tag object.
 * Tags are non-hierarchical taxonomies used to describe posts.
 */
export interface WpTag {
    /** The unique identifier for the tag */
    id?: number;
    /** URL-friendly version of the tag name (e.g., "javascript") */
    slug: string;
    /** Display name of the tag */
    name?: string;
    /** Full WordPress URL to the tag archive page */
    link?: string;
    /** Number of posts with this tag */
    count?: number;
    /** Tag description */
    description?: string;
    /** The taxonomy type (always "post_tag" for tags) */
    taxonomy?: string;
}

// =============================================================================
// MEDIA TYPES
// =============================================================================

/**
 * Media size details for a specific image size.
 */
export interface WpMediaSize {
    /** URL of the image at this size */
    file: string;
    /** Width in pixels */
    width: number;
    /** Height in pixels */
    height: number;
    /** MIME type of the image */
    mime_type?: string;
    /** Full URL to the image */
    source_url: string;
}

/**
 * Detailed information about media file dimensions and sizes.
 */
export interface WpMediaDetails {
    /** Original width in pixels */
    width: number;
    /** Original height in pixels */
    height: number;
    /** Original filename */
    file: string;
    /** File size in bytes */
    filesize?: number;
    /** Available image sizes */
    sizes?: {
        thumbnail?: WpMediaSize;
        medium?: WpMediaSize;
        medium_large?: WpMediaSize;
        large?: WpMediaSize;
        full?: WpMediaSize;
        [key: string]: WpMediaSize | undefined;
    };
    /** Image metadata (EXIF, etc.) */
    image_meta?: Record<string, unknown>;
}

/**
 * Represents a WordPress media/attachment object.
 */
export interface WpMedia {
    /** The unique identifier for the media item */
    id: number;
    /** URL-friendly identifier */
    slug: string;
    /** The date the media was uploaded (ISO 8601 format) */
    date: string;
    /** The date the media was last modified (ISO 8601 format) */
    modified: string;
    /** Media title */
    title: WpRenderedField;
    /** Media caption */
    caption: WpRenderedField;
    /** Alt text for accessibility */
    alt_text: string;
    /** MIME type of the media */
    mime_type: string;
    /** Media type (image, video, audio, etc.) */
    media_type: string;
    /** Full URL to the media file */
    source_url: string;
    /** Detailed media information */
    media_details: WpMediaDetails;
}

/**
 * Represents an image extracted from post content.
 * Used for content analysis and featured image fallbacks.
 */
export interface ContentImage {
    /** WordPress attachment ID (null if external image) */
    id: number | null;
    /** Full URL to the image */
    url: string;
    /** Alt text for accessibility */
    alt: string;
    /** Image width in pixels (null if unknown) */
    width: number | null;
    /** Image height in pixels (null if unknown) */
    height: number | null;
    /** Responsive image srcset attribute (null if not available) */
    srcset: string | null;
    /** Responsive image sizes attribute (null if not available) */
    sizes: string | null;
    /** Image caption (null if not provided) */
    caption: string | null;
}

// =============================================================================
// GUTENBERG BLOCK TYPES
// =============================================================================

/**
 * Attributes for a Gutenberg block.
 * Can contain any configuration options specific to the block type.
 */
export type GutenbergBlockAttributes = Record<string, unknown>;

/**
 * Represents a Gutenberg block from the WordPress REST API.
 * Note: The WordPress parser returns `blockName`, but our renderer uses `name`.
 * This interface matches what our GutenbergRenderer component expects.
 */
export interface GutenbergBlock {
    /** The block type name (e.g., "core/paragraph", "core/heading") */
    name: string;
    /** Block attributes containing configuration options */
    attrs: GutenbergBlockAttributes;
    /** Nested blocks within this block */
    innerBlocks: GutenbergBlock[];
    /** Raw HTML content of the block */
    innerHTML: string;
}

// =============================================================================
// EMBEDDED DATA TYPES
// =============================================================================

/**
 * Represents the _embedded data structure from the WordPress REST API.
 * Contains related data that was requested via the _embed parameter.
 */
export interface WpEmbedded {
    /** Array of authors (typically single author) */
    author?: WpAuthor[];
    /** Array of term arrays grouped by taxonomy */
    'wp:term'?: WpTerm[][];
    /** Featured media (featured image) */
    'wp:featuredmedia'?: WpMedia[];
    /** Parent post/page if applicable */
    up?: unknown[];
}

// =============================================================================
// CONTENT TYPES (POSTS AND PAGES)
// =============================================================================

/**
 * Base interface for common WordPress content fields.
 * Both pages and posts share these fundamental properties.
 */
export interface WpContentBase {
    /** Unique identifier for the content item */
    id: number;
    /** URL-friendly identifier for the content */
    slug: string;
    /** The title of the content */
    title: WpRenderedField;
    /** The date the content was published (ISO 8601 format) */
    date: string;
    /** The date the content was last modified (ISO 8601 format) */
    modified: string;
    /** Embedded author data when using _embed parameter */
    _embedded?: WpEmbedded;
}

/**
 * Represents a WordPress post object from the REST API.
 * Extends the base content interface with post-specific fields.
 *
 * Note: Some fields are optional because they may not be included
 * in all API responses (e.g., listing vs single post requests).
 */
export interface WpPost {
    /** The unique identifier for the post */
    id?: number;
    /** URL-friendly version of the post title */
    slug: string;
    /** Post title with HTML entity encoding from WordPress */
    title?: WpRenderedField;
    /** Post excerpt with HTML entity encoding from WordPress */
    excerpt?: WpRenderedField;
    /** The full HTML content of the post (optional, may not be included in list views) */
    content?: WpRenderedField;
    /** Full WordPress URL to the post */
    link?: string;
    /** ISO 8601 date string when the post was published */
    date?: string;
    /** ISO 8601 date string when the post was last modified */
    modified?: string;
    /** Parsed Gutenberg blocks (when available) */
    blocks?: GutenbergBlock[];
    /** Estimated reading time in minutes (added by custom plugin) */
    estimatedReadingTime?: number;
    /** Images extracted from post content */
    contentImages?: ContentImage[];
    /** Featured media ID */
    featured_media?: number;
    /** Post status (publish, draft, pending, etc.) */
    status?: string;
    /** Post type (usually "post") */
    type?: string;
    /** Post format (standard, aside, gallery, etc.) */
    format?: string;
    /** Author ID */
    author?: number;
    /** Category IDs */
    categories?: number[];
    /** Tag IDs */
    tags?: number[];
    /**
     * Embedded data from WordPress REST API _embed parameter.
     * Contains related author and taxonomy term data.
     */
    _embedded?: WpEmbedded;
}

/**
 * Represents a WordPress page object from the REST API.
 * Extends the base content interface with page-specific fields.
 */
export interface WpPage {
    /** Unique identifier for the page */
    id: number;
    /** URL-friendly identifier for the page */
    slug: string;
    /** The title of the page */
    title: WpRenderedField;
    /** The full HTML content of the page */
    content: WpRenderedField;
    /** The date the page was published (ISO 8601 format) */
    date: string;
    /** The date the page was last modified (ISO 8601 format) */
    modified: string;
    /** Parsed Gutenberg blocks (when available) */
    blocks?: GutenbergBlock[];
    /** Page status (publish, draft, pending, etc.) */
    status?: string;
    /** Page type (usually "page") */
    type?: string;
    /** Parent page ID (0 if top-level) */
    parent?: number;
    /** Menu order for hierarchical display */
    menu_order?: number;
    /** Featured media ID */
    featured_media?: number;
    /** Author ID */
    author?: number;
    /** Embedded data when using _embed parameter */
    _embedded?: WpEmbedded;
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

/**
 * Pagination metadata from WordPress REST API response headers.
 */
export interface WpPaginationMeta {
    /** Total number of items matching the query */
    total: number;
    /** Total number of pages available */
    totalPages: number;
    /** Current page number (1-indexed) */
    currentPage: number;
}

/**
 * Paginated posts response containing posts and pagination metadata.
 */
export interface WpPaginatedPosts {
    /** Array of post objects */
    posts: WpPost[];
    /** Total number of posts matching the query */
    totalPosts: number;
    /** Total number of pages available */
    totalPages: number;
    /** Current page number (1-indexed) */
    currentPage: number;
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/**
 * Options for fetching posts with pagination and filtering.
 */
export interface GetPostsOptions {
    /** Number of posts per page (default: 10, max: 100) */
    perPage?: number;
    /** Page number (1-indexed) */
    page?: number;
    /** Category ID to filter by */
    categoryId?: number;
    /** Author ID to filter by */
    authorId?: number;
    /** Search query */
    search?: string;
    /** Order by field */
    orderBy?: 'date' | 'title' | 'modified' | 'id';
    /** Order direction */
    order?: 'asc' | 'desc';
}

// =============================================================================
// DATE FORMATTING OPTIONS
// =============================================================================

/**
 * Options for formatting dates.
 */
export interface DateFormatOptions {
    /** Whether to include the year (default: true) */
    includeYear?: boolean;
    /** Date format style */
    format?: 'long' | 'short' | 'numeric';
    /** Locale for date formatting (default: 'en-US') */
    locale?: string;
}
