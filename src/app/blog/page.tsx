import Link from 'next/link';

interface Post {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	date: string;
}

// Dummy blog posts for now
const posts: Post[] = [
	{
		id: 1,
		slug: 'first-post',
		title: 'First Blog Post',
		excerpt: 'This is the first blog post on the site.',
		date: '2024-01-15'
	},
	{
		id: 2,
		slug: 'second-post',
		title: 'Second Blog Post',
		excerpt: 'This is the second blog post.',
		date: '2024-01-20'
	},
	{
		id: 3,
		slug: 'third-post',
		title: 'Getting Started with Next.js',
		excerpt: 'Learn how to build modern web applications with Next.js.',
		date: '2024-01-25'
	}
];

export default function BlogListing() {
	return (
		<main>
			<h1>Blog</h1>
			<p>{posts.length} posts</p>

			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<Link href={`/blog/${post.slug}`}>
							<h2>{post.title}</h2>
						</Link>
						<time>{new Date(post.date).toLocaleDateString()}</time>
						<p>{post.excerpt}</p>
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
