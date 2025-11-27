import axios from 'axios';
import Link from 'next/link';

export const revalidate = 60;

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
	_embedded?: {
		author?: Array<{
			name: string;
		}>;
		'wp:featuredmedia'?: Array<{
			source_url: string;
			alt_text?: string;
		}>;
	};
}

async function getPosts(page: number = 1, perPage: number = 10) {
	try {
		console.log('Fetching posts from:', `${process.env.WORDPRESS_API_URL}/posts?page=${page}&per_page=${perPage}&_embed`);

		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/posts?page=${page}&per_page=${perPage}&_embed`,
			{ timeout: 10000 }
		);

		const posts = response.data;
		const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
		const total = parseInt(response.headers['x-wp-total'] || '0', 10);

		return { posts, totalPages, total };
	} catch (error: any) {
		console.error('❌ API Error:', {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message
		});
		return { posts: [], totalPages: 0, total: 0 };
	}
}

export default async function BlogListing() {
	const { posts, total } = await getPosts(1, 100);

	return (
		<main className="min-h-screen p-8">
			<div className="max-w-6xl mx-auto">
				<header className="mb-12">
					<h1 className="text-5xl font-bold mb-4">Blog</h1>
					{total > 0 && (
						<p className="text-gray-600">
							{total} {total === 1 ? 'post' : 'posts'}
						</p>
					)}
				</header>

				{posts.length === 0 ? (
					<p className="text-gray-600">No posts found.</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{posts.map((post: Post) => (
							<article
								key={post.id}
								className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
							>
								<Link href={`/blog/${post.slug}`}>
									{/* Featured Image */}
									{post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
										<div className="aspect-video w-full overflow-hidden">
											<img
												src={post._embedded['wp:featuredmedia'][0].source_url}
												alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
												className="w-full h-full object-cover hover:scale-105 transition-transform"
											/>
										</div>
									)}

									<div className="p-6">
										{/* Title */}
										<h2 className="text-2xl font-bold mb-2 hover:text-blue-600 transition-colors">
											{post.title.rendered}
										</h2>

										{/* Date and Author */}
										<div className="text-sm text-gray-600 mb-4">
											<time>
												{new Date(post.date).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</time>
											{post._embedded?.author?.[0] && (
												<>
													{' • '}
													<span>{post._embedded.author[0].name}</span>
												</>
											)}
										</div>

										{/* Excerpt */}
										<div
											className="text-gray-700 line-clamp-3"
											dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
										/>
									</div>
								</Link>
							</article>
						))}
					</div>
				)}
			</div>
		</main>
	);
}

export const metadata = {
	title: 'Blog',
	description: 'Read our latest blog posts',
};
