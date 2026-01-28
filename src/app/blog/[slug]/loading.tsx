/**
 * Loading state for the single blog post page.
 *
 * Displays skeleton placeholders while the post content is being fetched.
 * Mirrors the structure of the actual blog post page for a smooth transition.
 */

import Box from '@/components/primitives/Box';
import Stack from '@/components/primitives/Stack';
import styles from './loading.module.scss';

/**
 * Skeleton placeholder component for loading states.
 */
function Skeleton({
    width = '100%',
    height = '1rem',
    className = ''
}: {
    width?: string;
    height?: string;
    className?: string;
}) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

/**
 * Skeleton for the author box component.
 */
function AuthorBoxSkeleton() {
    return (
        <div className={styles['author-skeleton']}>
            <Skeleton width="48px" height="48px" className={styles['avatar-skeleton']} />
            <Stack direction="column" spacing="xxx-small">
                <Skeleton width="8rem" height="1rem" />
                <Skeleton width="6rem" height="0.875rem" />
            </Stack>
        </div>
    );
}

/**
 * Skeleton for article content paragraphs.
 */
function ContentSkeleton() {
    return (
        <Stack direction="column" spacing="small" className={styles['content-skeleton']}>
            {/* Simulated paragraphs */}
            {Array.from({ length: 3 }).map((_, index) => (
                <Stack key={index} direction="column" spacing="xxx-small">
                    <Skeleton width="100%" height="1.25rem" />
                    <Skeleton width="100%" height="1.25rem" />
                    <Skeleton width="85%" height="1.25rem" />
                    <Skeleton width="70%" height="1.25rem" />
                </Stack>
            ))}
        </Stack>
    );
}

export default function BlogPostLoading() {
    return (
        <Box as="article" className={styles.loading} aria-label="Loading blog post" role="status">
            {/* Header skeleton */}
            <Box as="header" className={styles['header-skeleton']}>
                {/* Meta line (date and category) */}
                <Stack direction="row" spacing="xxx-small">
                    <Skeleton width="10rem" height="0.875rem" />
                    <Skeleton width="6rem" height="0.875rem" />
                </Stack>

                {/* Title */}
                <Stack direction="column" spacing="x-small" className={styles['title-skeleton']}>
                    <Skeleton width="100%" height="3rem" />
                    <Skeleton width="80%" height="3rem" />
                </Stack>

                {/* Author box */}
                <AuthorBoxSkeleton />

                {/* Summary box placeholder */}
                <div className={styles['summary-skeleton']}>
                    <Skeleton width="8rem" height="1rem" />
                    <Skeleton width="100%" height="1rem" />
                    <Skeleton width="90%" height="1rem" />
                </div>
            </Box>

            {/* Content skeleton */}
            <ContentSkeleton />

            {/* Footnote skeleton */}
            <Box className={styles['footnote-skeleton']}>
                <Skeleton width="15rem" height="0.875rem" />
            </Box>

            {/* Screen reader announcement */}
            <span className={styles['sr-only']}>Loading blog post, please wait...</span>
        </Box>
    );
}
