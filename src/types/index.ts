/**
 * Centralized type definitions for the application.
 * This barrel file provides a clean import path for all shared types.
 *
 * @module types
 */

// WordPress API types
export type {
    // Rendered content
    WpRenderedField,
    // Users/Authors
    WpAuthor,
    // Taxonomy
    WpTerm,
    WpCategory,
    WpTag,
    // Media
    WpMediaSize,
    WpMediaDetails,
    WpMedia,
    ContentImage,
    // Blocks
    GutenbergBlockAttributes,
    GutenbergBlock,
    // Embedded data
    WpEmbedded,
    // Content types
    WpContentBase,
    WpPost,
    WpPage,
    // Pagination
    WpPaginationMeta,
    WpPaginatedPosts,
    // API options
    GetPostsOptions,
    DateFormatOptions,
} from './wordpress';

// Component types
export type {
    // Spacing
    SpacingToken,
    // Typography
    TextPreset,
    // Base props
    BaseComponentProps,
    PolymorphicProps,
    PolymorphicComponentProps,
    // Layout
    FlexDirection,
    FlexAlignment,
    FlexJustify,
    StackLayoutProps,
    // Responsive
    Breakpoint,
    ResponsiveProp,
    // Component-specific
    PostCardProps,
    AuthorBoxProps,
} from './components';
