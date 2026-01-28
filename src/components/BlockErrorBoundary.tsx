'use client';

import { Component, ReactNode } from 'react';

interface Props {
    blockName: string;
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary for Gutenberg block components.
 * Catches render errors in individual blocks without crashing the page.
 */
export class BlockErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to console for debugging
        console.error(`Block "${this.props.blockName}" failed to render:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Production: Show nothing or minimal placeholder
            if (process.env.NODE_ENV === 'production') {
                return null;
            }

            // Development: Show error details for debugging
            return (
                <div
                    style={{
                        padding: '1rem',
                        background: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: '4px',
                        margin: '1rem 0'
                    }}
                >
                    <strong style={{ color: '#dc2626' }}>
                        Block Error: {this.props.blockName}
                    </strong>
                    <pre style={{ fontSize: '0.75rem', overflow: 'auto', marginTop: '0.5rem' }}>
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default BlockErrorBoundary;
