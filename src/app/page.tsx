import axios from 'axios';
import { GutenbergRenderer } from '@/components/GutenbergRenderer';

export const revalidate = 60;

async function getHomepage() {
	try {
		console.log('Fetching from:', `${process.env.WORDPRESS_API_URL}/pages/4696?_embed`);
		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/pages/4696?_embed`,
			{ timeout: 10000 }
		);
		const page = response.data;
		return { ...page };
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
	
	if (!page || !page.blocks) {
		return <div>Failed to load homepage</div>;
	}

	return <GutenbergRenderer blocks={page.blocks} />;
}