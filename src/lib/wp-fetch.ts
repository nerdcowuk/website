const WP_API_URL = process.env.WORDPRESS_API_URL;

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

export async function getPosts() {
	try {
		const response = await fetch(`${WP_API_URL}/posts`, {
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