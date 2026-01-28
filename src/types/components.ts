/**
 * Component-related TypeScript type definitions.
 * These types are used across React components in the application.
 *
 * @module types/components
 */

import type { ReactNode, ElementType, HTMLAttributes } from 'react';

// =============================================================================
// SPACING TOKENS
// =============================================================================

/**
 * Design system spacing token values.
 * These correspond to CSS custom properties defined in the design system.
 */
export type SpacingToken =
    | 'none'
    | 'xxx-small'
    | 'xx-small'
    | 'x-small'
    | 'small'
    | 'medium'
    | 'large'
    | 'x-large'
    | 'xx-large'
    | 'xxx-large'
    | 'floor'
    | 'storey';

// =============================================================================
// TEXT PRESETS
// =============================================================================

/**
 * Typography preset values for the Text component.
 * These correspond to predefined typography styles in the design system.
 */
export type TextPreset =
    | 'display-large'
    | 'display-medium'
    | 'display-small'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'heading-4'
    | 'heading-5'
    | 'heading-6'
    | 'body'
    | 'body-md'
    | 'body-sm'
    | 'caption'
    | 'label'
    | 'overline';

// =============================================================================
// BASE COMPONENT PROPS
// =============================================================================

/**
 * Base props shared by most components.
 * Provides common attributes and polymorphic rendering support.
 */
export interface BaseComponentProps {
    /** CSS class name(s) to apply */
    className?: string;
    /** Child elements to render */
    children?: ReactNode;
    /** Unique identifier for the element */
    id?: string;
    /** ARIA label for accessibility */
    'aria-label'?: string;
    /** ARIA labelledby for accessibility */
    'aria-labelledby'?: string;
    /** ARIA describedby for accessibility */
    'aria-describedby'?: string;
}

/**
 * Props for polymorphic components that can render as different HTML elements.
 *
 * @template E - The element type to render as
 */
export interface PolymorphicProps<E extends ElementType = 'div'> extends BaseComponentProps {
    /** The HTML element or component to render as */
    as?: E;
}

/**
 * Props for a polymorphic component with element-specific props merged in.
 * Excludes props already defined in the component's own props.
 *
 * @template E - The element type to render as
 * @template P - The component's own props
 */
export type PolymorphicComponentProps<
    E extends ElementType,
    P = object
> = P &
    PolymorphicProps<E> &
    Omit<HTMLAttributes<Element>, keyof P | keyof PolymorphicProps<E>>;

// =============================================================================
// LAYOUT PROPS
// =============================================================================

/**
 * Flex direction values for layout components.
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Alignment values for flex items.
 */
export type FlexAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Justification values for flex containers.
 */
export type FlexJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * Props for stack/flex layout components.
 */
export interface StackLayoutProps {
    /** Direction of the stack layout */
    direction?: FlexDirection;
    /** Spacing between items */
    spacing?: SpacingToken;
    /** Alignment of items along the cross axis */
    align?: FlexAlignment;
    /** Justification of items along the main axis */
    justify?: FlexJustify;
    /** Whether items should wrap */
    wrap?: boolean;
}

// =============================================================================
// RESPONSIVE PROPS
// =============================================================================

/**
 * Breakpoint names for responsive props.
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Makes a prop responsive by allowing different values at different breakpoints.
 *
 * @template T - The type of the prop value
 */
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

// =============================================================================
// POST CARD PROPS
// =============================================================================

/**
 * Props for post card components.
 */
export interface PostCardProps {
    /** Post title */
    title: string;
    /** URL to the post */
    url: string;
    /** Author name */
    authorName?: string;
    /** URL to the author page */
    authorUrl?: string;
    /** Formatted date string */
    date?: string;
    /** Reading time in minutes */
    readTime?: number;
    /** Post number/index for display */
    number?: number;
    /** Images from post content */
    images?: Array<{
        id: number | null;
        url: string;
        alt: string;
        width: number | null;
        height: number | null;
        srcset: string | null;
        sizes: string | null;
        caption: string | null;
    }>;
}

// =============================================================================
// AUTHOR BOX PROPS
// =============================================================================

/**
 * Props for author box components.
 */
export interface AuthorBoxProps {
    /** Author's avatar image URL */
    image?: string;
    /** Author's display name */
    name?: string;
    /** Author's role/title */
    role?: string;
    /** Author's bio or description */
    children?: ReactNode;
}
