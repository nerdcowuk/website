import cn from 'classnames';
import { ReactNode } from 'react';
import Box from "@/components/blocks/Box/Box"
import Text from "@/components/blocks/Text/Text"
import styles from './AuthorBox.module.scss';

interface AuthorBoxProps {
    className?: string,
    children: React.ReactNode,
    [key: string]: any;
}

export default function AuthorBox({
    name,
    role,
    image,
    children,
    className,
    ...restProps
}: AuthorBoxProps) {
    const classNames = cn(
        styles[`ncos-author-box`],
        className,
    );

    return (
        <Box className={classNames} {...restProps}>
            <img className={styles[`ncos-author-box__image`]} src={image} />
            <Box>
                <Text>
                    <Text as="a" href="/blog/author">{name}</Text> is a <Text as="strong">{role}</Text> at NerdCow, {children}
                </Text>
            </Box>
        </Box>
    );
}
