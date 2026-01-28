/**
 * Block Component Registry (Re-export)
 *
 * This file re-exports all functions from '@/lib/wordpress/blocks' for backward compatibility.
 * New code should import directly from '@/lib/wordpress/blocks' or '@/lib/wordpress'.
 *
 * @module block-registry
 * @deprecated Import from '@/lib/wordpress/blocks' or '@/lib/wordpress' instead
 */

export {
    getBlockComponent,
    blockComponents,
    normalizeBlockName,
    getBlockNamespace,
    getBlockType,
    isBlockFromNamespace,
    isCoreBlock,
    hasBlockComponent,
    getRegisteredBlockNames,
} from './wordpress/blocks';
