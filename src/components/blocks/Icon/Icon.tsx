import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    size?: number | string;
    className?: string;
}

export default function Icon({ 
    icon: IconComponent, 
    size = 24, 
    className = '',
    ...props 
}: IconProps) {
    return (
        <IconComponent
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
            {...props}
        />
    );
}