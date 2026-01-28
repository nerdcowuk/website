/**
 * WordPress type definitions re-exports.
 *
 * This file re-exports types from the centralized @/types module
 * for backward compatibility. New code should import directly from @/types.
 *
 * @module wordpress/types
 * @deprecated Import types from '@/types' instead
 */

export type {
    WpRenderedField,
    WpAuthor,
    WpTerm,
    WpCategory,
    WpTag,
    WpMediaSize,
    WpMediaDetails,
    WpMedia,
    ContentImage,
    GutenbergBlockAttributes,
    GutenbergBlock,
    WpEmbedded,
    WpContentBase,
    WpPost,
    WpPage,
    WpPaginationMeta,
    WpPaginatedPosts,
    GetPostsOptions,
    DateFormatOptions,
} from '@/types';
