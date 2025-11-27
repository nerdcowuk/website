import Link from 'next/link';

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
			<h1>Blog</h1>
			<p>{posts.length} posts</p>

			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<Link href={`/blog/${post.slug}`}>
							<h2>{post.title.rendered}</h2>
						</Link>
						<time>{new Date(post.date).toLocaleDateString()}</time>
						<div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
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
