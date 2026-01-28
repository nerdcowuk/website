/**
 * Loading state for the blog listing page.
 *
 * Displays skeleton placeholders while blog posts are being fetched.
 * Uses CSS animations for the shimmer effect.
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
 * Skeleton card representing a loading post card.
 */
function PostCardSkeleton() {
    return (
        <div className={styles['post-card-skeleton']}>
            <Stack direction="column" spacing="x-small">
                <Skeleton width="80%" height="1.5rem" />
                <Skeleton width="60%" height="1rem" />
                <Stack direction="row" spacing="xxx-small">
                    <Skeleton width="5rem" height="0.875rem" />
                    <Skeleton width="5rem" height="0.875rem" />
                </Stack>
            </Stack>
        </div>
    );
}

export default function BlogLoading() {
    return (
        <Box className={styles.loading} aria-label="Loading blog posts" role="status">
            {/* Featured section skeleton */}
            <Box as="section" className={styles['featured-skeleton']}>
                <Stack direction="column" spacing="floor">
                    <Stack direction="column" spacing="x-small">
                        <Skeleton width="6rem" height="1rem" />
                        <Skeleton width="100%" height="3rem" className={styles['title-skeleton']} />
                        <Skeleton width="80%" height="3rem" className={styles['title-skeleton']} />
                    </Stack>
                    <Skeleton width="100%" height="1.25rem" />
                    <Skeleton width="70%" height="1.25rem" />
                    <Stack direction="row" spacing="xxx-small">
                        <Skeleton width="6rem" height="0.875rem" />
                        <Skeleton width="6rem" height="0.875rem" />
                    </Stack>
                </Stack>
            </Box>

            {/* Feed section skeleton */}
            <Box as="section" className={styles['feed-skeleton']}>
                <Stack direction="column" spacing="floor">
                    <Skeleton width="8rem" height="1.25rem" />
                    <Stack spacing="small" direction="column">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </Stack>
                </Stack>
            </Box>

            {/* Screen reader announcement */}
            <span className={styles['sr-only']}>Loading blog posts, please wait...</span>
        </Box>
    );
}
