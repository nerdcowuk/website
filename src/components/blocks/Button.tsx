import cn from 'classnames';
import { ReactNode } from 'react';

interface ButtonProps {
    as?: string | React.ComponentType<any>;
    className?: string;
    children?: ReactNode;
    href?: string;
    variant?: string;
    target?: string;
    rel?: string;
    modal?: boolean;
    modalId?: number;
    modalType?: string;
    modalDisableGutters?: boolean;
    [key: string]: any;
}

export default function Button({
    as: Tag = 'button',
    className,
    children,
    href,
    variant,
    target,
    rel,
    modal,
    modalId,
    modalType,
    modalDisableGutters,
    ...props
}: ButtonProps) {
    const classNames = cn(
        'ncos-button',
        className,
        variant && `ncos-button--${variant}`
    );

    // Use <a> for href, button otherwise
    const Component = href ? 'a' : Tag;

    return (
        <Component
            className={classNames}
            {...(href && { href, target, rel })}
            {...(modal && {
                'data-modal': modal,
                'data-modal-id': modalId,
                'data-modal-type': modalType,
                'data-modal-disable-gutters': modalDisableGutters
            })}
            {...props}
        >
            <span className="ncos-button__state-layer">
                <span className="ncos-button__label">{children}</span>
            </span>
        </Component>
    );
}