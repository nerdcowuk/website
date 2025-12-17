import cn from 'classnames';
import { ReactNode } from 'react';
import styles from './Media.module.scss';

interface MediaProps {
    src: string;
    className?: string;
    alt?: string;
    caption?: string;
    [key: string]: any;
}

export default function Media({
    src,
    className,
    alt,
    caption,
    ...restProps
}: MediaProps) {
    const classNames = cn(
        styles[`ncos-media`],
        className,
    );

    return (
        <figure className={classNames} {...restProps}>
            <img src={src} alt={alt}/>
            {caption}
        </figure>
    );
}
