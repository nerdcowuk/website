import { notFound } from 'next/navigation';
import { GutenbergRenderer } from '@/components/GutenbergRenderer';
import { getPostBySlug } from '@/lib/wp-fetch';

export const revalidate = 60;

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

	// Parse Gutenberg blocks from content
	const blocks = post.blocks || [];

	return (
		<article>

			<header>
				{post.date && (
					<time>
						{new Date(post.date).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</time>
				)}

				<h1>{post.title.rendered}</h1>

				{post._embedded?.author && post._embedded.author[0] && (
					<div className="mt-2 text-sm text-gray-600">
						By {post._embedded.author[0].name}
					</div>
				)}

				<p>Summary bro...</p>
			</header>

			{/* squiggle innit */}

			{blocks.length > 0 ? (
				<GutenbergRenderer blocks={blocks} />
			) : (
				/* Fallback to rendered HTML if blocks aren't available */
				<div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
			)}
		</article>
	);
}