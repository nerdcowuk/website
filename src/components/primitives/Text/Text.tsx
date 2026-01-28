import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './Text.module.scss';
import { sanitizeWordPressHtml } from '@/lib/wordpress/sanitize';

interface TextProps {
    as?: string | React.ComponentType<any>;
    className?: string;
    children?: string | ReactNode;
    preset?: string;
    align?: string;
    tag?: string;
    /** When true, string children are treated as HTML and rendered using dangerouslySetInnerHTML */
    dangerouslySetHtml?: boolean;
    [key: string]: any;
}

export default function Text({
    as,
    className,
    children,
    preset,
    align,
    tag,
    dangerouslySetHtml = false,
    ...props
}: TextProps) {
    // Use tag as the element if provided, otherwise use as, otherwise default to 'p'
    const Tag = (tag || as || 'p') as any;

    const classNames = cn(
        styles[`ncos-text`],
        styles[`ncos-text--tag-${Tag}`],
        preset && styles[`ncos-text--preset-${preset}`],
        align && styles[`ncos-text--align-${align}`],
        className
    );

    // Handle string children that should be rendered as HTML
    // This uses sanitization to prevent XSS attacks
    if (typeof children === 'string' && dangerouslySetHtml) {
        const sanitizedHtml = sanitizeWordPressHtml(children);
        return (
            <Tag
                className={classNames}
                {...props}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        );
    }

    // For ReactNode children or plain text strings, render normally
    // ReactNode children are already processed by React and don't need sanitization
    // Plain text strings (when dangerouslySetHtml is false) are safely escaped by React
    return (
        <Tag className={classNames} {...props}>{children}</Tag>
    );
}
