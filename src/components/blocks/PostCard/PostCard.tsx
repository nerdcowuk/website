'use client';

import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Box from "@/components/blocks/Box/Box"
import Text from "@/components/blocks/Text/Text"
import Stack from '@/components/blocks/Stack/Stack';
import Media from '@/components/blocks/Media/Media';
import Link from 'next/link';
import styles from './PostCard.module.scss';

interface PostCardImage {
    id: number | null;
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
    srcset: string | null;
    sizes: string | null;
    caption: string | null;
}

interface PostCardProps {
    className?: string,
    number?: number,
    title: string,
    url: string,
    authorName?: string,
    authorUrl?: string,
    date?: string,
    readTime?: number,
    images?: PostCardImage[],
    [key: string]: any;
}

function Gallery({ images }: { images: PostCardImage[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    return (
        <Box className={styles[`ncos-post-card__gallery`]}>
            <Box className={styles[`ncos-post-card__gallery-viewport`]} ref={emblaRef}>
                <Box className={styles[`ncos-post-card__gallery-container`]}>
                    {images.map((image, index) => (
                        <Box className={styles[`ncos-post-card__gallery-slide`]} key={image.id ?? index}>
                            <Media
                                src={image.url}
                                alt={image.alt}
                                width={image.width ?? undefined}
                                height={image.height ?? undefined}
                                srcSet={image.srcset ?? undefined}
                                sizes={image.sizes ?? undefined}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Stack direction='column' spacing={'xxx-small'} className={styles[`ncos-post-card__gallery-controls`]}>
                <Box className={styles[`ncos-post-card__gallery-dots`]}>
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                styles[`ncos-post-card__gallery-dot`],
                                index === selectedIndex && styles[`ncos-post-card__gallery-dot--active`]
                            )}
                            onClick={() => scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </Box>
                <Text as='span' preset='caption' className={styles[`ncos-post-card__gallery-counter`]}>
                    {selectedIndex + 1}/{images.length}
                </Text>
            </Stack>
        </Box>
    );
}

const NumberSvg = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 36 37">
            <path fill="var(--ncos-colour-sys-secondary)" d="M3.736 8.506C-.26 14.83 3.577 25.561 8.71 30.151c9.755 8.019 24.925 3.305 24.412-10.808-.066-3.967-1.307-7.953-3.305-11.354-4.686-8.585-13.359-5.806-20.08-1.523a.788.788 0 0 1-1.092-.269.835.835 0 0 1 .215-1.082c1.717-1.256 3.538-2.396 5.507-3.306 3.958-1.907 9-2.779 12.976-.22 7.281 4.953 10.315 16.106 7.767 24.499-4.612 14.88-26.12 13.97-32.187.747C.039 21.04-1.67 13.163 2.457 7.53c.653-.805 1.848.163 1.26.997l.019-.02Z"/>
        </svg>
    )
}

export default function PostCard({
    className,
    number,
    title,
    url,
    authorName,
    authorUrl,
    date,
    readTime,
    images,
    ...restProps
}: PostCardProps) {
    const classNames = cn(
        styles[`ncos-post-card`],
        className,
    );

    return (
        <Stack direction={'column'} spacing={'floor'} className={classNames} {...restProps}>
            <Stack spacing={'x-small'} className={styles[`ncos-post-card__content`]}>
                {number && (
                    <Box className={styles[`ncos-post-card__number`]}>
                        <NumberSvg />
                        <Text as='span' preset='heading-6'>{number}</Text>
                    </Box>
                )}
                {!number && (
                    <Box className={styles[`ncos-post-card__bullet`]}/>
                )}
                <Stack spacing={'xx-small'} direction='column'>
                    <Text as={'h4'}><Link href={url} title={title}>{title}</Link></Text>
                    <Stack direction='row' spacing='xxx-small'>
                        {authorName && (
                            <Text preset='caption'>
                                {authorUrl ? <Link href={authorUrl}>{authorName}</Link> : authorName}
                            </Text>
                        )}
                        <Stack direction='row' spacing='xxx-small' wrap={false}>
                            {date && <Text preset='caption'>{date}</Text>}
                            {readTime && (
                                <>
                                    <Text preset='caption'>|</Text>
                                    <Text preset='caption'>{readTime} min</Text>
                                </>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            {images && images.length > 0 && (
                <Gallery images={images} />
            )}
        </Stack>
    );
}
