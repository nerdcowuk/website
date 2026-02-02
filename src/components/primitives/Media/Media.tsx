import cn from 'classnames';
import styles from './Media.module.scss';

interface MediaProps {
    src: string;
    className?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
    srcSet?: string;
    sizes?: string;
}

export default function Media({
    src,
    className,
    alt = '',
    caption,
    width,
    height,
    sizes,
}: MediaProps) {
    const classNames = cn(styles[`ncos-media`], className);

    return (
        <figure className={classNames}>
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                sizes={sizes}
            />
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    );
}
