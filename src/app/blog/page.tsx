import Link from 'next/link';
import Box from '@/components/blocks/Box/Box';
import Text from '@/components/blocks/Text/Text';
import Stack from '@/components/blocks/Stack/Stack';
import styles from './page.module.scss';

import { getPosts } from '@/lib/wp-fetch';

export default async function BlogListing() {
	const posts = await getPosts();

	return (
		<Box className={styles[`archive`]}>
			<Box as='section' className={styles[`archive__featured`]}>
				<Stack direction='column' spacing='floor'>
					<Stack direction='column' spacing='x-small'>
						<Text preset="heading-5">Featured</Text>
						<Text as="h1" preset='display-small'>Website navigation for a complex SaaS product structure</Text>
					</Stack>
					<Text>When a SaaS product grows beyond solving one problem for a small audience, creating user journeys becomes a hassle.</Text>
					<Stack direction='row' spacing='xxx-small'>
						<Text preset='caption'><Link href={'#'}>Dawid Zimny</Link></Text>
						<Stack direction='row' spacing='xxx-small' wrap={false}>
							<Text preset='caption'>14th Nov 2025</Text>
							<Text preset='caption'>|</Text>
							<Text preset='caption'>7 min</Text>
						</Stack>
					</Stack>
				</Stack>
			</Box>
			<Box as="section" className={styles[`archive__feed`]}>
				<Stack direction='column'>
					{posts.map((post) => (
						<Box key={post.id}>
							<Link href={`/blog/${post.slug}`}>
								<Text>➡️ {post.title.rendered}</Text>
							</Link>
						</Box>
					))}
				</Stack>
				<Stack direction='column' as='aside'>
					Praaaa
				</Stack>
			</Box>
			<Box as='section'>
				Categories bro
			</Box>
			<Box as="section" className={styles[`archive__feed`]}>
				<Stack direction='column'>
					{posts.map((post) => (
						<Box key={post.id}>
							<Link href={`/blog/${post.slug}`}>
								<Text>➡️ {post.title.rendered}</Text>
							</Link>
						</Box>
					))}
				</Stack>
				<Stack direction='column' as='aside'>
					Praaaa
				</Stack>
			</Box>
		</Box>
	);
}

export const metadata = {
	title: 'Blog',
	description: 'Read our latest blog posts',
};
