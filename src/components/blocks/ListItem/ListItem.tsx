import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './ListItem.module.scss';

interface ListItemProps {
    className?: string;
    children: ReactNode | string;
    [key: string]: any;
}

export default function ListItem({
    className,
    children,
    ...restProps
}: ListItemProps) {

    const classNames = cn(
        styles[`ncos-list__item`],
        className,
    );

    return (
        <li className={classNames} {...restProps}>
            {children}
        </li>
    );
}
