import cn from 'classnames';
import { ReactNode } from 'react';

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
    theme,
    width,
    gutters,
    ...restProps 
}: BoxProps) {
    const classNames = cn(
        'ncos-crate',
        className,
        theme && `ncos-crate--theme-${theme}`,
        width && `ncos-container--max-width-${width}`,
        gutters === false && 'ncos-container--disable-gutters'
    );

    return (
        <Tag className={classNames} {...restProps}>
            {children}
        </Tag>
    );
}