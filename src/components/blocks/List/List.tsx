import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './List.module.scss';

interface ListProps {
    className?: string;
    ordered?: boolean;
    children: ReactNode | string;
    [key: string]: any;
}

export default function List({
    className,
    ordered,
    children,
    ...restProps
}: ListProps) {

    const Tag = ordered ? 'ol' : 'ul';

    const classNames = cn(
        styles[`ncos-list`],
        className,
    );

    return (
        <Tag className={classNames} {...restProps}>
            {children}
        </Tag>
    );
}
