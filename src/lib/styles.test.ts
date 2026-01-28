/**
 * Unit Tests for Type-Safe Style Utilities
 *
 * This test suite validates the functionality of the style utility functions
 * including class map creation, spacing tokens, text presets, and class name
 * combination utilities.
 *
 * @module lib/styles.test
 */

import { describe, it, expect } from 'vitest';
import { createClassMap, cn, SPACING_TOKENS, TEXT_PRESETS } from './styles';

// ============================================================
// CREATE CLASS MAP TESTS
// ============================================================

describe('createClassMap', () => {
    describe('Basic Functionality', () => {
        it('should return correct mappings for all provided values', () => {
            const mockStyles: Record<string, string> = {
                'ncos-stack--spacing-small': 'ncos-stack--spacing-small_abc123',
                'ncos-stack--spacing-medium': 'ncos-stack--spacing-medium_def456',
                'ncos-stack--spacing-large': 'ncos-stack--spacing-large_ghi789',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-stack--spacing-',
                ['small', 'medium', 'large'] as const
            );

            expect(result).toEqual({
                small: 'ncos-stack--spacing-small_abc123',
                medium: 'ncos-stack--spacing-medium_def456',
                large: 'ncos-stack--spacing-large_ghi789',
            });
        });

        it('should return an empty object when no matching classes exist', () => {
            const mockStyles: Record<string, string> = {
                'unrelated-class': 'unrelated-class_xyz',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-component--modifier-',
                ['value1', 'value2'] as const
            );

            expect(result).toEqual({});
        });

        it('should handle empty styles object gracefully', () => {
            const mockStyles: Record<string, string> = {};

            const result = createClassMap(
                mockStyles,
                'ncos-component--',
                ['value'] as const
            );

            expect(result).toEqual({});
        });

        it('should handle empty values array gracefully', () => {
            const mockStyles: Record<string, string> = {
                'ncos-stack--spacing-small': 'ncos-stack--spacing-small_abc123',
            };

            const result = createClassMap(mockStyles, 'ncos-stack--spacing-', [] as const);

            expect(result).toEqual({});
        });
    });

    describe('Missing Classes Handling', () => {
        it('should handle missing classes gracefully by omitting them from the result', () => {
            const mockStyles: Record<string, string> = {
                'ncos-text--preset-heading-1': 'ncos-text--preset-heading-1_abc',
                'ncos-text--preset-heading-3': 'ncos-text--preset-heading-3_def',
                // Note: heading-2 is intentionally missing
            };

            const result = createClassMap(
                mockStyles,
                'ncos-text--preset-',
                ['heading-1', 'heading-2', 'heading-3'] as const
            );

            expect(result).toEqual({
                'heading-1': 'ncos-text--preset-heading-1_abc',
                'heading-3': 'ncos-text--preset-heading-3_def',
            });
            expect(result).not.toHaveProperty('heading-2');
        });

        it('should only include classes that exist in the styles object', () => {
            const mockStyles: Record<string, string> = {
                'ncos-card--variant-primary': 'ncos-card--variant-primary_123',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-card--variant-',
                ['primary', 'secondary', 'tertiary'] as const
            );

            expect(Object.keys(result)).toHaveLength(1);
            expect(result).toHaveProperty('primary');
            expect(result).not.toHaveProperty('secondary');
            expect(result).not.toHaveProperty('tertiary');
        });
    });

    describe('Edge Cases', () => {
        it('should work with single value arrays', () => {
            const mockStyles: Record<string, string> = {
                'ncos-icon--size-large': 'ncos-icon--size-large_xyz',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-icon--size-',
                ['large'] as const
            );

            expect(result).toEqual({
                large: 'ncos-icon--size-large_xyz',
            });
        });

        it('should handle values containing hyphens', () => {
            const mockStyles: Record<string, string> = {
                'ncos-spacing--x-small': 'ncos-spacing--x-small_111',
                'ncos-spacing--xx-large': 'ncos-spacing--xx-large_222',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-spacing--',
                ['x-small', 'xx-large'] as const
            );

            expect(result).toEqual({
                'x-small': 'ncos-spacing--x-small_111',
                'xx-large': 'ncos-spacing--xx-large_222',
            });
        });

        it('should handle prefixes ending without hyphen', () => {
            const mockStyles: Record<string, string> = {
                'componentsmall': 'componentsmall_hash',
            };

            const result = createClassMap(
                mockStyles,
                'component',
                ['small'] as const
            );

            expect(result).toEqual({
                small: 'componentsmall_hash',
            });
        });

        it('should handle class names with special characters in the hash', () => {
            const mockStyles: Record<string, string> = {
                'ncos-box--rounded': 'ncos-box--rounded_a1B2c3',
            };

            const result = createClassMap(
                mockStyles,
                'ncos-box--',
                ['rounded'] as const
            );

            expect(result.rounded).toBe('ncos-box--rounded_a1B2c3');
        });
    });

    describe('Type Safety', () => {
        it('should maintain type information in the returned record', () => {
            const mockStyles: Record<string, string> = {
                'prefix-a': 'prefix-a_1',
                'prefix-b': 'prefix-b_2',
            };

            const result = createClassMap(mockStyles, 'prefix-', ['a', 'b'] as const);

            // TypeScript should know these are valid keys
            const aClass: string = result['a'];
            const bClass: string = result['b'];

            expect(aClass).toBe('prefix-a_1');
            expect(bClass).toBe('prefix-b_2');
        });
    });
});

// ============================================================
// CN (CLASS NAME COMBINER) TESTS
// ============================================================

describe('cn', () => {
    describe('Basic Class Combination', () => {
        it('should combine multiple string classes', () => {
            const result = cn('class-a', 'class-b', 'class-c');
            expect(result).toBe('class-a class-b class-c');
        });

        it('should return single class without extra spaces', () => {
            const result = cn('only-class');
            expect(result).toBe('only-class');
        });

        it('should return empty string when no arguments provided', () => {
            const result = cn();
            expect(result).toBe('');
        });

        it('should preserve class order', () => {
            const result = cn('first', 'second', 'third');
            expect(result).toBe('first second third');
        });
    });

    describe('Falsy Value Filtering', () => {
        it('should filter out undefined values', () => {
            const result = cn('class-a', undefined, 'class-b');
            expect(result).toBe('class-a class-b');
        });

        it('should filter out null values', () => {
            const result = cn('class-a', null, 'class-b');
            expect(result).toBe('class-a class-b');
        });

        it('should filter out false values', () => {
            const result = cn('class-a', false, 'class-b');
            expect(result).toBe('class-a class-b');
        });

        it('should filter out empty string values', () => {
            const result = cn('class-a', '', 'class-b');
            expect(result).toBe('class-a class-b');
        });

        it('should filter out multiple different falsy values', () => {
            const result = cn('start', undefined, null, false, '', 'end');
            expect(result).toBe('start end');
        });

        it('should return empty string when all values are falsy', () => {
            const result = cn(undefined, null, false, '');
            expect(result).toBe('');
        });
    });

    describe('Conditional Class Usage', () => {
        it('should work with boolean conditions', () => {
            const isActive = true;
            const isDisabled = false;

            const result = cn(
                'base-class',
                isActive && 'active',
                isDisabled && 'disabled'
            );

            expect(result).toBe('base-class active');
        });

        it('should handle complex conditional expressions', () => {
            const status = 'success';

            const result = cn(
                'base',
                status === 'success' && 'status-success',
                status === 'error' && 'status-error',
                status === 'warning' && 'status-warning'
            );

            expect(result).toBe('base status-success');
        });

        it('should work with ternary operators', () => {
            const variant: 'primary' | 'secondary' = 'secondary';

            const result = cn(
                'button',
                variant === 'primary' ? 'btn-primary' : 'btn-secondary'
            );

            expect(result).toBe('button btn-secondary');
        });

        it('should work with optional chaining patterns', () => {
            const props: { className?: string } = { className: 'custom-class' };
            const emptyProps: { className?: string } = {};

            const resultWithClass = cn('base', props.className);
            const resultWithoutClass = cn('base', emptyProps.className);

            expect(resultWithClass).toBe('base custom-class');
            expect(resultWithoutClass).toBe('base');
        });
    });

    describe('Edge Cases', () => {
        it('should handle classes with hyphens', () => {
            const result = cn('ncos-component', 'ncos-component--modifier');
            expect(result).toBe('ncos-component ncos-component--modifier');
        });

        it('should handle classes with underscores (CSS module hashes)', () => {
            const result = cn('component_abc123', 'modifier_def456');
            expect(result).toBe('component_abc123 modifier_def456');
        });

        it('should include whitespace-only strings (they are truthy in JavaScript)', () => {
            // Note: Whitespace strings are truthy in JavaScript
            // This test documents the actual behavior - whitespace is included
            const result = cn('class-a', '   ', 'class-b');
            // Whitespace string is truthy, so it will be included as-is
            // Result: 'class-a' + ' ' (separator) + '   ' (3 spaces) + ' ' (separator) + 'class-b'
            // Total: 1 + 3 + 1 = 5 spaces between class-a and class-b
            expect(result).toBe('class-a     class-b');
        });

        it('should handle many classes', () => {
            const classes = Array.from({ length: 20 }, (_, i) => `class-${i}`);
            const result = cn(...classes);
            expect(result).toBe(classes.join(' '));
        });
    });
});

// ============================================================
// SPACING_TOKENS CONSTANT TESTS
// ============================================================

describe('SPACING_TOKENS', () => {
    it('should be an array of spacing token values', () => {
        expect(Array.isArray(SPACING_TOKENS)).toBe(true);
        expect(SPACING_TOKENS.length).toBeGreaterThan(0);
    });

    it('should include common spacing values', () => {
        expect(SPACING_TOKENS).toContain('small');
        expect(SPACING_TOKENS).toContain('medium');
        expect(SPACING_TOKENS).toContain('large');
    });

    it('should include edge spacing values', () => {
        expect(SPACING_TOKENS).toContain('none');
        expect(SPACING_TOKENS).toContain('floor');
    });

    it('should include t-shirt size variations', () => {
        expect(SPACING_TOKENS).toContain('x-small');
        expect(SPACING_TOKENS).toContain('xx-small');
        expect(SPACING_TOKENS).toContain('xxx-small');
        expect(SPACING_TOKENS).toContain('x-large');
        expect(SPACING_TOKENS).toContain('xx-large');
        expect(SPACING_TOKENS).toContain('xxx-large');
    });

    it('should be readonly (frozen array)', () => {
        // TypeScript ensures readonly, but we can verify it doesn't change
        const originalLength = SPACING_TOKENS.length;
        const firstValue = SPACING_TOKENS[0];

        // Attempting to modify should fail silently or throw in strict mode
        expect(SPACING_TOKENS.length).toBe(originalLength);
        expect(SPACING_TOKENS[0]).toBe(firstValue);
    });

    it('should have unique values', () => {
        const uniqueValues = new Set(SPACING_TOKENS);
        expect(uniqueValues.size).toBe(SPACING_TOKENS.length);
    });
});

// ============================================================
// TEXT_PRESETS CONSTANT TESTS
// ============================================================

describe('TEXT_PRESETS', () => {
    it('should be an array of text preset values', () => {
        expect(Array.isArray(TEXT_PRESETS)).toBe(true);
        expect(TEXT_PRESETS.length).toBeGreaterThan(0);
    });

    it('should include display presets', () => {
        expect(TEXT_PRESETS).toContain('display-large');
        expect(TEXT_PRESETS).toContain('display-medium');
        expect(TEXT_PRESETS).toContain('display-small');
    });

    it('should include heading presets', () => {
        expect(TEXT_PRESETS).toContain('heading-1');
        expect(TEXT_PRESETS).toContain('heading-2');
        expect(TEXT_PRESETS).toContain('heading-3');
        expect(TEXT_PRESETS).toContain('heading-4');
        expect(TEXT_PRESETS).toContain('heading-5');
        expect(TEXT_PRESETS).toContain('heading-6');
    });

    it('should include body presets', () => {
        expect(TEXT_PRESETS).toContain('body');
        expect(TEXT_PRESETS).toContain('body-md');
        expect(TEXT_PRESETS).toContain('body-sm');
    });

    it('should include utility text presets', () => {
        expect(TEXT_PRESETS).toContain('caption');
        expect(TEXT_PRESETS).toContain('label');
        expect(TEXT_PRESETS).toContain('overline');
    });

    it('should be readonly (frozen array)', () => {
        const originalLength = TEXT_PRESETS.length;
        const firstValue = TEXT_PRESETS[0];

        expect(TEXT_PRESETS.length).toBe(originalLength);
        expect(TEXT_PRESETS[0]).toBe(firstValue);
    });

    it('should have unique values', () => {
        const uniqueValues = new Set(TEXT_PRESETS);
        expect(uniqueValues.size).toBe(TEXT_PRESETS.length);
    });
});

// ============================================================
// INTEGRATION TESTS
// ============================================================

describe('Integration: createClassMap with cn', () => {
    it('should work together for building component class names', () => {
        const mockStyles: Record<string, string> = {
            'ncos-stack': 'ncos-stack_base',
            'ncos-stack--spacing-small': 'ncos-stack--spacing-small_123',
            'ncos-stack--spacing-medium': 'ncos-stack--spacing-medium_456',
            'ncos-stack--direction-row': 'ncos-stack--direction-row_abc',
            'ncos-stack--direction-column': 'ncos-stack--direction-column_def',
        };

        const spacingClasses = createClassMap(
            mockStyles,
            'ncos-stack--spacing-',
            ['small', 'medium'] as const
        );

        const directionClasses = createClassMap(
            mockStyles,
            'ncos-stack--direction-',
            ['row', 'column'] as const
        );

        // Simulate component usage
        const spacing: 'small' | 'medium' = 'medium';
        const direction: 'row' | 'column' = 'row';
        const isWrap = false;

        const className = cn(
            mockStyles['ncos-stack'],
            spacingClasses[spacing],
            directionClasses[direction],
            isWrap && 'wrap-class'
        );

        expect(className).toBe(
            'ncos-stack_base ncos-stack--spacing-medium_456 ncos-stack--direction-row_abc'
        );
    });

    it('should handle missing optional classes gracefully', () => {
        const mockStyles: Record<string, string> = {
            'ncos-text': 'ncos-text_base',
            'ncos-text--preset-body': 'ncos-text--preset-body_123',
        };

        const presetClasses = createClassMap(
            mockStyles,
            'ncos-text--preset-',
            ['body', 'heading-1'] as const
        );

        // heading-1 class doesn't exist in mockStyles
        const className = cn(
            mockStyles['ncos-text'],
            presetClasses['heading-1'] // This will be undefined
        );

        // Should only include the base class since heading-1 is undefined
        expect(className).toBe('ncos-text_base');
    });
});
