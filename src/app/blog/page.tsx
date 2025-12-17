import Link from 'next/link';
import Text from '@/components/blocks/Text/Text';
import { getPosts } from '@/lib/wp-fetch';

export default async function BlogListing() {
	const posts = await getPosts();

	return (
		<main>
			<Text as="h1">Blog</Text>

			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<Link href={`/blog/${post.slug}`}>
							<Text>➡️ {post.title.rendered}</Text>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}

export const metadata = {
	title: 'Blog',
	description: 'Read our latest blog posts',
};
