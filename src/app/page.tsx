// src/app/page.tsx
import axios from 'axios';

export const revalidate = 60;

async function getHomepage() {
	try {
		console.log('Fetching from:', `${process.env.WORDPRESS_API_URL}/pages/4696?_embed`);
		
		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/pages/4696?_embed`, // Remove &blocks=1
			{ timeout: 10000 }
		);
	
		return response.data;
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

export default async function HomePage() {
	const page = await getHomepage();
	
	if (!page) {
		return <div>Failed to load homepage</div>;
	}

	// Temporarily render HTML to test API works
	return (
		<div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
			<div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
		</div>
	);
}