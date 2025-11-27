import axios from 'axios';
import { notFound } from 'next/navigation';
import { GutenbergRenderer } from '@/components/GutenbergRenderer';

export const revalidate = 60;

interface PageProps {
	params: Promise<{
		slug: string;
	}>;
}

async function getPostBySlug(slug: string) {
	try {
		console.log('Fetching post from:', `${process.env.WORDPRESS_API_URL}/posts?slug=${slug}&_embed`);

		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/posts?slug=${slug}&_embed`,
			{ timeout: 10000 }
		);

		const posts = response.data;

		// WordPress REST API returns an array, get the first post
		if (!posts || posts.length === 0) {
			return null;
		}

		return posts[0];
	} catch (error: any) {
		console.error('❌ API Error:', {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message
		});
		return null;
	}
}

export default async function BlogPost({ params }: PageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	// Parse Gutenberg blocks from content
	const blocks = post.blocks || [];

	return (
		<main className="min-h-screen">
			<article>
				{/* Post Header */}
				<header className="mb-8">
					<h1 className="text-4xl font-bold mb-4">{post.title.rendered}</h1>

					{post.date && (
						<time className="text-gray-600 text-sm">
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
					)}

					{/* Author info if embedded */}
					{post._embedded?.author && post._embedded.author[0] && (
						<div className="mt-2 text-sm text-gray-600">
							By {post._embedded.author[0].name}
						</div>
					)}
				</header>

				{/* Featured Image if available */}
				{post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
					<div className="mb-8">
						<img
							src={post._embedded['wp:featuredmedia'][0].source_url}
							alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
							className="w-full h-auto rounded-lg"
						/>
					</div>
				)}

				{/* Post Content - Gutenberg Blocks */}
				{blocks.length > 0 ? (
					<GutenbergRenderer blocks={blocks} />
				) : (
					/* Fallback to rendered HTML if blocks aren't available */
					<div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
				)}
			</article>
		</main>
	);
}

// Generate static params for known posts (optional - for SSG)
export async function generateStaticParams() {
	try {
		// Skip if WordPress API URL is not configured
		if (!process.env.WORDPRESS_API_URL) {
			console.warn('⚠️ WORDPRESS_API_URL not configured, skipping static generation');
			return [];
		}

		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/posts?per_page=100`,
			{ timeout: 10000 }
		);

		const posts = response.data;

		if (!Array.isArray(posts)) {
			console.warn('⚠️ WordPress API returned non-array response');
			return [];
		}

		return posts.map((post: any) => ({
			slug: post.slug,
		}));
	} catch (error: any) {
		// This is expected to fail during build if WordPress is not accessible
		// Return empty array to allow dynamic rendering instead
		if (error.code === 'ERR_BAD_RESPONSE' && error.response?.status === 500) {
			console.warn('⚠️ WordPress API returned 500, skipping static generation. Posts will be generated on-demand.');
		} else {
			console.warn('⚠️ Could not fetch posts for static generation:', error.message);
		}
		return [];
	}
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);

	if (!post) {
		return {
			title: 'Post Not Found',
		};
	}

	return {
		title: post.title.rendered,
		description: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
		openGraph: {
			title: post.title.rendered,
			description: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
			images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? [
				{
					url: post._embedded['wp:featuredmedia'][0].source_url,
					alt: post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered,
				}
			] : [],
		},
	};
}
