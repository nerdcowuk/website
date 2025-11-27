import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="min-h-screen flex items-center justify-center p-8">
			<div className="text-center">
				<h1 className="text-6xl font-bold mb-4">404</h1>
				<h2 className="text-2xl mb-4">Blog Post Not Found</h2>
				<p className="text-gray-600 mb-8">
					The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
				</p>
				<Link
					href="/blog"
					className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Back to Blog
				</Link>
			</div>
		</main>
	);
}
