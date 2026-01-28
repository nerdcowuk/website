/**
 * Type-safe style utilities.
 *
 * Maps component prop values to CSS module class names
 * with full TypeScript support.
 *
 * @module lib/styles
 */

import type { SpacingToken, TextPreset } from '@/types';

/**
 * Creates a type-safe class name map from CSS module styles.
 *
 * This utility maps design token values to their corresponding CSS module
 * class names, providing type safety and autocomplete for style props.
 *
 * @template T - The string literal type of the token values
 * @param styles - The CSS module styles object containing class name mappings
 * @param prefix - The CSS class name prefix (e.g., 'ncos-stack--spacing-')
 * @param values - The array of token values to map
 * @returns A record mapping token values to their CSS module class names
 *
 * @example
 * ```typescript
 * const spacingClasses = createClassMap(styles, 'ncos-stack--spacing-', [
 *   'floor', 'x-small', 'small', 'medium', 'large'
 * ] as const);
 * // spacingClasses['small'] => 'ncos-stack--spacing-small_abc123'
 * ```
 */
export function createClassMap<T extends string>(
    styles: Record<string, string>,
    prefix: string,
    values: readonly T[]
): Record<T, string> {
    const map = {} as Record<T, string>;

    for (const value of values) {
        const className = `${prefix}${value}`;
        if (styles[className]) {
            map[value] = styles[className];
        }
    }

    return map;
}

/**
 * Spacing token values for validation and iteration.
 *
 * These values correspond to the CSS custom properties defined in the design system:
 * - `--ncos-spacing-{token}` for base spacing scale
 *
 * @remarks
 * This array should stay in sync with the SpacingToken type definition
 * in `/src/types/components.ts`.
 */
export const SPACING_TOKENS: readonly SpacingToken[] = [
    'none',
    'xxx-small',
    'xx-small',
    'x-small',
    'small',
    'medium',
    'large',
    'x-large',
    'xx-large',
    'xxx-large',
    'floor',
    'storey',
] as const;

/**
 * Text preset values for validation and iteration.
 *
 * These values correspond to the typography presets defined in the design system,
 * which control font size, weight, line height, and letter spacing.
 *
 * @remarks
 * This array should stay in sync with the TextPreset type definition
 * in `/src/types/components.ts`.
 */
export const TEXT_PRESETS: readonly TextPreset[] = [
    'display-large',
    'display-medium',
    'display-small',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-4',
    'heading-5',
    'heading-6',
    'body',
    'body-md',
    'body-sm',
    'caption',
    'label',
    'overline',
] as const;

/**
 * Combines multiple class names into a single string, filtering out falsy values.
 *
 * This utility function provides a clean way to conditionally combine CSS class names.
 * It filters out `undefined`, `null`, `false`, and empty strings.
 *
 * @param classes - The class names to combine (can include falsy values)
 * @returns A space-separated string of truthy class names
 *
 * @example
 * ```typescript
 * // Basic usage
 * cn('foo', 'bar') // => 'foo bar'
 *
 * // With conditionals
 * cn('base', isActive && 'active', isDisabled && 'disabled')
 * // If isActive is true and isDisabled is false => 'base active'
 *
 * // With undefined/null values
 * cn('base', undefined, null, '', 'end') // => 'base end'
 * ```
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
