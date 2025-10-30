import cn from 'classnames';

interface StackProps {
    className?: string;
    metadata?: any;
    innerBlocks?: any[];
    children?: React.ReactNode;
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
        'ncos-stack',
        className,
        direction && `ncos-stack--direction-${direction}`,
        spacing && `ncos-stack--spacing-${spacing}`,
        align && `ncos-stack--align-${align}`,
        justify && `ncos-stack--justify-${justify}`,
        wrap === false && 'ncos-stack--no-wrap'
    );
    return (
        <Tag className={classNames} {...props}>
            {children}
        </Tag>
    );
}