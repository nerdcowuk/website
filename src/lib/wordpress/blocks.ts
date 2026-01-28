/**
 * Gutenberg Block Utilities
 *
 * This module provides utilities for working with Gutenberg blocks, including:
 * - Block name normalization (converting WordPress block names to component names)
 * - Block component registry (mapping block names to React components)
 *
 * @module wordpress/blocks
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// =============================================================================
// BLOCK NAME NORMALIZATION
// =============================================================================

/**
 * Normalizes a WordPress Gutenberg block name to a PascalCase component name.
 *
 * Takes a block name in the format "namespace/block-name" and returns
 * a PascalCase string suitable for use as a React component name.
 *
 * @param blockName - The WordPress block name (e.g., "core/paragraph", "ncos/section")
 * @returns The normalized PascalCase name (e.g., "Paragraph", "Section")
 *
 * @example
 * normalizeBlockName('custom/hero'); // Returns: 'Hero'
 * normalizeBlockName('core/paragraph'); // Returns: 'Paragraph'
 * normalizeBlockName('acme/testimonial-block'); // Returns: 'TestimonialBlock'
 * normalizeBlockName('ncos/my_custom_block'); // Returns: 'MyCustomBlock'
 * normalizeBlockName(null); // Returns: ''
 */
export function normalizeBlockName(blockName: string | null): string {
    if (!blockName) return '';

    // Get the part after the namespace (after the slash)
    // Then split by hyphens and underscores to get individual words
    const nameParts = blockName.split('/').pop()?.split(/[-_]/) || [];

    // Capitalize the first letter of each part and join them
    return nameParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Extracts the namespace from a WordPress block name.
 *
 * @param blockName - The WordPress block name (e.g., "core/paragraph")
 * @returns The namespace (e.g., "core") or empty string if no namespace
 *
 * @example
 * getBlockNamespace('core/paragraph'); // Returns: 'core'
 * getBlockNamespace('ncos/section'); // Returns: 'ncos'
 * getBlockNamespace('paragraph'); // Returns: ''
 */
export function getBlockNamespace(blockName: string | null): string {
    if (!blockName) return '';
    const parts = blockName.split('/');
    return parts.length > 1 ? parts[0] : '';
}

/**
 * Extracts the block type from a WordPress block name (without namespace).
 *
 * @param blockName - The WordPress block name (e.g., "core/paragraph")
 * @returns The block type (e.g., "paragraph")
 *
 * @example
 * getBlockType('core/paragraph'); // Returns: 'paragraph'
 * getBlockType('ncos/section'); // Returns: 'section'
 * getBlockType('paragraph'); // Returns: 'paragraph'
 */
export function getBlockType(blockName: string | null): string {
    if (!blockName) return '';
    const parts = blockName.split('/');
    return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Checks if a block name belongs to a specific namespace.
 *
 * @param blockName - The WordPress block name
 * @param namespace - The namespace to check against
 * @returns True if the block belongs to the namespace
 *
 * @example
 * isBlockFromNamespace('core/paragraph', 'core'); // Returns: true
 * isBlockFromNamespace('ncos/section', 'core'); // Returns: false
 */
export function isBlockFromNamespace(blockName: string | null, namespace: string): boolean {
    return getBlockNamespace(blockName) === namespace;
}

/**
 * Checks if a block is a core WordPress block.
 *
 * @param blockName - The WordPress block name
 * @returns True if it's a core WordPress block
 */
export function isCoreBlock(blockName: string | null): boolean {
    return isBlockFromNamespace(blockName, 'core');
}

// =============================================================================
// BLOCK COMPONENT REGISTRY
// =============================================================================

/**
 * Block component registry mapping normalized block names to React components.
 *
 * SSR is enabled by default for static content blocks to ensure proper SEO
 * and faster initial page loads. Only truly interactive blocks that require
 * client-side state (like carousels) should have `ssr: false`.
 *
 * @example
 * // Adding a new block component:
 * // 1. Create the component in @/components/blocks/
 * // 2. Add an entry here with the normalized name as key
 * //
 * // For static content blocks (recommended):
 * // Hero: dynamic(() => import('@/components/blocks/Hero/Hero').then(mod => mod.default)),
 * //
 * // For interactive blocks requiring client-side state:
 * // Carousel: dynamic(() => import('@/components/blocks/Carousel/Carousel').then(mod => mod.default), { ssr: false }),
 */
const blockComponents: Record<string, ComponentType<any>> = {
    // Layout components (primitives) - SSR enabled for SEO
    Section: dynamic(
        () => import('@/components/primitives/Box/Box').then(mod => mod.default)
    ),
    Stack: dynamic(
        () => import('@/components/primitives/Stack/Stack').then(mod => mod.default)
    ),

    // Content components - SSR enabled for SEO
    Text: dynamic(
        () => import('@/components/primitives/Text/Text').then(mod => mod.default)
    ),
    List: dynamic(
        () => import('@/components/blocks/List/List').then(mod => mod.default)
    ),
    ListItem: dynamic(
        () => import('@/components/blocks/ListItem/ListItem').then(mod => mod.default)
    ),

    // Media components (primitives) - SSR enabled for SEO
    Media: dynamic(
        () => import('@/components/primitives/Media/Media').then(mod => mod.default)
    ),

    // UI components (primitives) - SSR enabled for SEO
    Button: dynamic(
        () => import('@/components/primitives/Button/Button').then(mod => mod.default)
    ),
    Divider: dynamic(
        () => import('@/components/primitives/Divider/Divider').then(mod => mod.default)
    ),
};

/**
 * Returns a React component corresponding to a Gutenberg block name.
 *
 * Looks up the block name in the component registry and returns the
 * corresponding React component. Returns null if the block is not registered.
 *
 * @param blockName - The WordPress block name (e.g., "ncos/section")
 * @returns The React component or null if not found
 *
 * @example
 * const Component = getBlockComponent('ncos/section');
 * if (Component) {
 *   return <Component {...attrs}>{children}</Component>;
 * }
 */
export function getBlockComponent(blockName: string | null): ComponentType<any> | null {
    if (!blockName) return null;
    const normalized = normalizeBlockName(blockName);
    const component = blockComponents[normalized];
    return component ?? null;
}

/**
 * Checks if a block has a registered component.
 *
 * @param blockName - The WordPress block name
 * @returns True if the block has a registered component
 */
export function hasBlockComponent(blockName: string | null): boolean {
    return getBlockComponent(blockName) !== null;
}

/**
 * Returns all registered block component names.
 *
 * @returns Array of registered block names
 */
export function getRegisteredBlockNames(): string[] {
    return Object.keys(blockComponents);
}

// Export the block components map for advanced use cases
export { blockComponents };
