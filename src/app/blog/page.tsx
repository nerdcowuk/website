import Link from 'next/link';
import Text from '@/components/blocks/Text/Text';

interface Post {
	id: number;
	slug: string;
	title: {
		rendered: string;
	};
	excerpt: {
		rendered: string;
	};
	date: string;
}

async function getPosts() {
	try {
		const response = await fetch('https://nerdcow.co.uk/wp-json/wp/v2/posts', {
			next: { revalidate: 60 }
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch posts: ${response.status}`);
		}

		const posts: Post[] = await response.json();
		return posts;
	} catch (error) {
		console.error('Error fetching posts:', error);
		return [];
	}
}

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
