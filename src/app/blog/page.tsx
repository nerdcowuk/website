import Link from 'next/link';
import Box from '@/components/primitives/Box';
import Text from '@/components/primitives/Text';
import Stack from '@/components/primitives/Stack';
import PostCard from '@/components/patterns/PostCard';
import Divider from '@/components/primitives/Divider';
import styles from './page.module.scss';

import { getPosts } from '@/lib/wp-fetch';
import { getTitle, getSlug, getDateString, getAuthorName, getAuthorUrl, getReadTime, getContentImages } from '@/lib/theme-functions';

export default async function BlogListing() {
	const { posts } = await getPosts();

	return (
		<Box className={styles[`archive`]}>
			<Box as='section' className={styles[`archive__featured`]}>
				<Stack direction='column' spacing='floor'>
					<Stack direction='column' spacing='x-small'>
						<Text as="label" preset="heading-5">Featured</Text>
						<Text as="h1" preset='display-small'>Website navigation for a complex SaaS product structure</Text>
					</Stack>
					<Text>When a SaaS product grows beyond solving one problem for a small audience, creating user journeys becomes a hassle.</Text>
					<Stack direction='row' spacing='xxx-small' className={styles[`archive__featured__meta`]}>
						<Text preset='caption'><Link href={'#'}>Dawid Zimny</Link></Text>
						<Stack direction='row' spacing='xxx-small'>
							<Text preset='caption'>14th Nov 2025</Text>
							<Text preset='caption'>|</Text>
							<Text preset='caption'>7 min</Text>
						</Stack>
					</Stack>
				</Stack>
			</Box>
			<Box as="section" className={`${styles['archive__feed']} ${styles['archive__feed--picks']}`} >
				<Stack direction='column' spacing='floor'>
					<Text as={'h5'}>Just for you</Text>
					<Stack spacing='small' direction='column'>
						{posts.map((post, index) => (
							<>
								<PostCard
									key={post.id}
									number={index + 1}
									title={getTitle(post)}
									url={`/blog/${getSlug(post)}`}
									authorName={getAuthorName(post)}
									authorUrl={getAuthorUrl(post)}
									date={getDateString(post)}
									readTime={getReadTime(post) ?? undefined}
									images={getContentImages(post)}
								/>
								<Divider />
							</>
						))}
					</Stack>
				</Stack>
				<Stack direction='column' as='aside'>
					Categories bro
				</Stack>
			</Box>
			<Box as="section" className={`${styles['archive__feed']} ${styles['archive__feed--latest']}`} >
				<Stack direction='column' spacing='floor'>
					<Text as={'h5'}>Latest</Text>
					<Stack spacing='small' direction='column'>
						{posts.map((post, index) => (
							<>
								<PostCard
									key={post.id}
									title={getTitle(post)}
									url={`/blog/${getSlug(post)}`}
									authorName={getAuthorName(post)}
									authorUrl={getAuthorUrl(post)}
									date={getDateString(post)}
									readTime={getReadTime(post) ?? undefined}
									images={getContentImages(post)}
								/>
								<Divider />
							</>
						))}
					</Stack>
				</Stack>
				<Stack direction='column' as='aside'>
					Most popular brooo
				</Stack>
			</Box>
		</Box>
	);
}

export const metadata = {
	title: 'Blog',
	description: 'Read our latest blog posts',
};
