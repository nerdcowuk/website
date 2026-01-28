import cn from 'classnames';
import Image from 'next/image';
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
    priority?: boolean;
    fill?: boolean;
}

/**
 * Media component for displaying images with optional captions
 *
 * Uses Next.js Image component for optimization. Supports two modes:
 * - Fixed dimensions: When width and height are provided
 * - Fill mode: When dimensions are unknown, uses fill prop with relative parent
 *
 * @param props - Media component props
 * @returns Figure element containing optimized image and optional caption
 */
export default function Media({
    src,
    className,
    alt = '',
    caption,
    width,
    height,
    sizes,
    priority = false,
    fill = false,
}: MediaProps) {
    const classNames = cn(
        styles[`ncos-media`],
        fill && styles[`ncos-media--fill`],
        className,
    );

    const hasKnownDimensions = width && height && !fill;

    return (
        <figure className={classNames}>
            {hasKnownDimensions ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes={sizes}
                    priority={priority}
                />
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes || '100vw'}
                    priority={priority}
                    style={{ objectFit: 'cover' }}
                />
            )}
            {caption && <figcaption>{caption}</figcaption>}
        </figure>
    );
}
