import axios from 'axios';

export async function getPostById(id: number) {
	try {
		const response = await axios.get(
			`${process.env.WORDPRESS_API_URL}/pages/${id}?_embed`,
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

export async function getPostBySlug(slug: string) {
    try {
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