import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './Button.module.scss';

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
        styles.button,
        className,
        variant && styles[`button--variant-${variant}`]
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
            <span className={styles.button__stateLayer}>
                <span className={styles.button__label}>{children}</span>
            </span>
        </Component>
    );
}
