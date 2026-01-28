'use client';

/**
 * Global Error Page
 *
 * This component serves as the error boundary for the entire application.
 * It catches unhandled errors and provides a user-friendly error message
 * with the option to retry.
 *
 * Note: This must be a Client Component because error boundaries need
 * to handle errors during client-side rendering.
 */

import { useEffect } from 'react';
import Box from '@/components/primitives/Box';
import Stack from '@/components/primitives/Stack';
import Text from '@/components/primitives/Text';
import Button from '@/components/primitives/Button';
import styles from './error.module.scss';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log the error to an error reporting service in production
        console.error('Application error:', error);
    }, [error]);

    return (
        <Box as="main" className={styles.error}>
            <Stack direction="column" spacing="small" className={styles['error__content']}>
                <Text as="h1" preset="display-small" className={styles['error__title']}>
                    Something went wrong
                </Text>

                <Text preset="body-lg" className={styles['error__message']}>
                    We apologise for the inconvenience. An unexpected error has occurred.
                </Text>

                {/* Show error details only in development */}
                {process.env.NODE_ENV === 'development' && (
                    <Box className={styles['error__details']}>
                        <Text preset="caption" as="pre">
                            {error.message}
                        </Text>
                        {error.digest && (
                            <Text preset="caption">
                                Error ID: {error.digest}
                            </Text>
                        )}
                    </Box>
                )}

                <Stack direction="row" spacing="small" className={styles['error__actions']}>
                    <Button
                        onClick={reset}
                        variant="primary"
                        aria-label="Retry loading the page"
                    >
                        Try again
                    </Button>
                    <Button
                        as="a"
                        href="/"
                        variant="secondary"
                        aria-label="Return to the home page"
                    >
                        Go home
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
