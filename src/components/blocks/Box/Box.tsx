import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './Box.module.scss';

interface BoxProps {
    as?: string | React.ComponentType<any>;
    className?: string;
    children?: ReactNode;
    theme?: string;
    width?: string;
    gutters?: boolean | string;
    innerBlocks?: any[];
    [key: string]: any;
}

export default function Box({
    as: Tag = 'section',
    className,
    children,
    width,
    gutters,
    ...restProps
}: BoxProps) {
    const classNames = cn(
        styles.box,
        className,
        width && styles[`box--max-width-${width}`],
        gutters === false && styles['box--disable-gutters']
    );

    return (
        <Tag className={classNames} {...restProps}>
            {children}
        </Tag>
    );
}
