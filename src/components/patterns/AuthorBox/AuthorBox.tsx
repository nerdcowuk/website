import cn from 'classnames';
import Image from 'next/image';
import Box from '@/components/primitives/Box';
import Text from '@/components/primitives/Text';
import { getAuthorUrl } from '@/lib/wordpress/urls';
import styles from './AuthorBox.module.scss';

interface AuthorBoxProps {
    /** Optional CSS class name for custom styling */
    className?: string;
    /** Additional content to display after the role description */
    children: React.ReactNode;
    /** The display name of the author */
    name?: string;
    /** The author's role/job title at the company */
    role?: string;
    /** URL to the author's avatar/profile image */
    image?: string;
    /** The author's URL slug for generating the profile link */
    slug?: string;
}

/**
 * AuthorBox component for displaying author information with avatar.
 * The author's name links to their blog author page using the slug prop.
 *
 * @param props - AuthorBox component props
 * @returns Author box with avatar image and bio text
 *
 * @example
 * <AuthorBox
 *   name="John Doe"
 *   role="Senior Developer"
 *   image="/images/authors/john-doe.jpg"
 *   slug="john-doe"
 * >
 *   specializing in React and TypeScript development.
 * </AuthorBox>
 */
export default function AuthorBox({
    name,
    role,
    image,
    slug,
    children,
    className,
}: AuthorBoxProps) {
    const classNames = cn(
        styles[`ncos-author-box`],
        className,
    );

    // Generate the author's profile URL from their slug, fallback to /blog if no slug
    const authorUrl = slug ? getAuthorUrl({ slug }) : '/blog';

    return (
        <Box className={classNames}>
            {image && (
                <Image
                    className={styles[`ncos-author-box__image`]}
                    src={image}
                    alt={name ? `${name}'s avatar` : 'Author avatar'}
                    width={64}
                    height={64}
                />
            )}
            <Box>
                <Text preset="body-md">
                    <Text as="a" href={authorUrl}>{name}</Text> is a <Text as="strong">{role}</Text> at NerdCow, {children}
                </Text>
            </Box>
        </Box>
    );
}
