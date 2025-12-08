import cn from 'classnames';
import styles from './Stack.module.scss';

interface StackProps {
    as?: string | React.ComponentType<any>;
    className?: string;
    metadata?: any;
    innerBlocks?: any[];
    children?: React.ReactNode;
    direction?: string;
    spacing?: number;
    align?: string;
    justify?: string;
    wrap?: boolean;
    [key: string]: any;
}

export default function Stack({
    as: Tag = 'div',
    className,
    children,
    direction,
    spacing,
    align,
    justify,
    wrap,
    ...props
}: StackProps) {
    const classNames = cn(
        styles[`ncos-stack`],
        className,
        direction && styles[`ncos-stack--direction-${direction}`],
        spacing && styles[`ncos-stack--spacing-${spacing}`],
        align && styles[`ncos-stack--align-${align}`],
        justify && styles[`ncos-stack--justify-${justify}`],
        wrap === false && styles['ncos-stack--noWrap']
    );
    return (
        <Tag className={classNames} {...props}>
            {children}
        </Tag>
    );
}
