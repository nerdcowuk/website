import sanitizeHtml from 'sanitize-html';
import cn from 'classnames';
import { ReactNode } from 'react';

interface TextProps {
    as?: string | React.ComponentType<any>;
    className?: string;
    children?: string | ReactNode;
    preset?: string;
    align?: string;
    tag?: string;
    [key: string]: any;
}

export default function Text({
    as,
    className,
    children,
    preset,
    align,
    tag,
    ...props
}: TextProps) {
    // Use tag as the element if provided, otherwise use as, otherwise default to 'p'
    const Tag = (tag || as || 'p') as any;

    const classNames = cn(
        'ncos-text',
        className,
        preset && `ncos-text--preset-${preset}`,
        align && `ncos-text--align-${align}`,
        tag && `ncos-text--tag-${tag}`
    );

    // For non-string children (React nodes with HTML), don't sanitize
    // For string children, allow common inline formatting tags
    const cleanContent = typeof children === 'string' ? sanitizeHtml(children, {
        allowedTags: ['strong', 'em', 'span', 'a', 'br'],
        allowedAttributes: {
            span: ['class'],
            a: ['href', 'target', 'rel', 'class']
        }
    }) : children;

    return (
        <Tag className={classNames} {...props}>{cleanContent}</Tag>
    );
}