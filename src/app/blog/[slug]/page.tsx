import { notFound } from 'next/navigation';
import { GutenbergRenderer } from '@/components/GutenbergRenderer';
import Box from '@/components/primitives/Box';
import Stack from '@/components/primitives/Stack';
import Text from '@/components/primitives/Text';
import AuthorBox from '@/components/patterns/AuthorBox';
import InfoBox from '@/components/blocks/InfoBox';
import { getPostBySlug } from '@/lib/wp-fetch';
import { getDate, getModifiedDate, getCategories, getTitle, getExcerpt, getAuthor, getAuthorSlug } from '@/lib/theme-functions';
import { sanitizeWordPressHtml } from '@/lib/wordpress/sanitize';

interface PageProps {
	params: Promise<{
		slug: string;
	}>;
}

export default async function BlogPost({ params }: PageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const date = getDate(post);
	const modifiedDate = getModifiedDate(post);
	const categories = getCategories(post);
	const title = getTitle(post);
	const excerpt = getExcerpt(post);
	const author = getAuthor(post);
	const authorSlug = getAuthorSlug(post);

	// Parse Gutenberg blocks from content
	const blocks = post.blocks || [];

	return (
		<Box as={'article'}>

			<Stack as={'header'} direction='column' spacing='floor' align='center'>
				<Text as="h5" preset="caption">
					{date && (
						<Text as="span">Published {date}</Text>
					)}
					{` `}
					{categories && (
						<Text as="span">
							in {categories}
						</Text>
					)}
				</Text>

				<Text as="h1" preset='display-small'>{title}</Text>

				{author && (
					<AuthorBox
						image={author.avatar_urls?.[48]}
						name={author.name}
						slug={authorSlug || undefined}
						role={'Product Manager'}
					>
						{author.description}
					</AuthorBox>
				)}
			</Stack>

			<Box as={'main'}>
				{excerpt && <InfoBox title={'5-second summary'}><Text preset="body-small">{excerpt}</Text></InfoBox>}
				
				<Stack direction='column' spacing='floor'>
					{blocks.length > 0 ? (
						<GutenbergRenderer blocks={blocks} />
					) : (
						/* Fallback to rendered HTML if blocks aren't available - sanitized for security */
						<div dangerouslySetInnerHTML={{ __html: sanitizeWordPressHtml(post.content?.rendered) }} />
					)}
				</Stack>
			</Box>

			<Box className="footnote">
				<Text preset="caption">Originally published {date}, updated {modifiedDate}.</Text>
			</Box>

		</Box>
	);
}