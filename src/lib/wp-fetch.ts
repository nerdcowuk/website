const WP_API_URL = 'https://nerdcow.co.uk/wp-json/wp/v2';

export async function getPostById(id: number) {
	try {
		const response = await fetch(`${WP_API_URL}/pages/${id}?_embed`, {
			next: { revalidate: 60 }
		});

		if (!response.ok) {
			return null;
		}

		const page = await response.json();
		return page;
	} catch (error: any) {
		console.error('❌ API Error:', error);
		return null;
	}
}

export async function getPostBySlug(slug: string) {
    try {
        const response = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed`, {
			next: { revalidate: 60 }
		});

		if (!response.ok) {
			return null;
		}

        const posts = await response.json();

        // WordPress REST API returns an array, get the first post
        if (!posts || posts.length === 0) {
            return null;
        }

        return posts[0];
    } catch (error: any) {
        console.error('❌ API Error:', error);
        return null;
    }
}

export async function getCategoryById(id: number) {
    try {
        const response = await fetch(`${WP_API_URL}/categories/${id}`, {
			next: { revalidate: 60 }
		});

		if (!response.ok) {
			return null;
		}

        const category = await response.json();

        // WordPress REST API returns an array, get the first post
        if (!category || category.length === 0) {
            return null;
        }

        return category;
    } catch (error: any) {
        console.error('❌ API Error:', error);
        return null;
    }
}