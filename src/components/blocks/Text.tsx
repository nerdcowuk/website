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
    as: Tag = 'p',
    className,
    children,
    preset,
    align,
    tag,
    ...props 
}: TextProps) {
    const classNames = cn(
        'ncos-text',
        className,
        preset && `ncos-text--preset-${preset}`,
        align && `ncos-text--align-${align}`,
        tag && `ncos-text--tag-${tag}`
    );

	console.log(children);
	
    const cleanContent = typeof children === 'string' ? sanitizeHtml(children, {
        allowedTags: ['strong', 'em', 'span'],
        allowedAttributes: {
            span: ['class']
        }
    }) : children;

    return (
        <Tag className={classNames} {...props}>{cleanContent}</Tag>
    );
}