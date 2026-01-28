/**
 * Block Name Normalization (Re-export)
 *
 * This file re-exports the normalizeBlockName function from '@/lib/wordpress/blocks'
 * for backward compatibility.
 * New code should import directly from '@/lib/wordpress/blocks' or '@/lib/wordpress'.
 *
 * @module normalize-block-name
 * @deprecated Import from '@/lib/wordpress/blocks' or '@/lib/wordpress' instead
 */

export { normalizeBlockName } from './wordpress/blocks';
