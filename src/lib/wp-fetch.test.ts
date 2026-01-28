/**
 * Test suite for WordPress API Fetch Utilities
 *
 * These tests cover input validation, error handling, and successful API responses
 * for all functions in the wp-fetch module.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the environment variable before importing the module
const MOCK_API_URL = 'https://example.com/wp-json/wp/v2';

// Store original env and fetch
const originalEnv = process.env.WORDPRESS_API_URL;
const originalFetch = global.fetch;

describe('wp-fetch module', () => {
	beforeEach(() => {
		// Set up environment variable
		process.env.WORDPRESS_API_URL = MOCK_API_URL;

		// Reset fetch mock
		vi.resetModules();
		global.fetch = vi.fn();

		// Suppress console.error during tests to keep output clean
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore original values
		process.env.WORDPRESS_API_URL = originalEnv;
		global.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	describe('URL Validation', () => {
		test('should throw error when WORDPRESS_API_URL is undefined', async () => {
			delete process.env.WORDPRESS_API_URL;

			await expect(async () => {
				await import('./wp-fetch');
			}).rejects.toThrow('WORDPRESS_API_URL environment variable is not defined');
		});

		test('should throw error for malformed URL', async () => {
			process.env.WORDPRESS_API_URL = 'not-a-valid-url';

			await expect(async () => {
				await import('./wp-fetch');
			}).rejects.toThrow('WORDPRESS_API_URL is not a valid URL');
		});

		test('should accept valid URL', async () => {
			process.env.WORDPRESS_API_URL = MOCK_API_URL;

			// Mock fetch to prevent actual network calls
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([]),
			});

			// This should not throw
			const wpFetchModule = await import('./wp-fetch');
			expect(wpFetchModule).toBeDefined();
			expect(typeof wpFetchModule.getPosts).toBe('function');
		});
	});

	describe('getPostById', () => {
		test('should return null for invalid ID (negative)', async () => {
			const { getPostById } = await import('./wp-fetch');

			const result = await getPostById(-1);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Invalid post ID: -1')
			);
		});

		test('should return null for invalid ID (NaN)', async () => {
			const { getPostById } = await import('./wp-fetch');

			const result = await getPostById(NaN);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should return null for invalid ID (0)', async () => {
			const { getPostById } = await import('./wp-fetch');

			const result = await getPostById(0);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Invalid post ID: 0')
			);
		});

		test('should return null for invalid ID (float)', async () => {
			const { getPostById } = await import('./wp-fetch');

			const result = await getPostById(1.5);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should fetch post from /posts endpoint', async () => {
			const mockPost = {
				id: 123,
				slug: 'test-post',
				title: { rendered: 'Test Post' },
				excerpt: { rendered: 'Test excerpt' },
				date: '2024-01-01T00:00:00',
				modified: '2024-01-01T00:00:00',
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockPost),
			});

			const { getPostById } = await import('./wp-fetch');
			const result = await getPostById(123);

			expect(global.fetch).toHaveBeenCalledWith(
				`${MOCK_API_URL}/posts/123?_embed`,
				expect.objectContaining({ next: { revalidate: 300 } })
			);
			expect(result).toEqual(mockPost);
		});

		test('should return null on 404', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found',
			});

			const { getPostById } = await import('./wp-fetch');
			const result = await getPostById(999);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch post by ID "999": HTTP 404 Not Found')
			);
		});

		test('should return null on network error', async () => {
			const networkError = new Error('Network failure');
			global.fetch = vi.fn().mockRejectedValue(networkError);

			const { getPostById } = await import('./wp-fetch');
			const result = await getPostById(123);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Network error fetching post by ID "123"'),
				networkError
			);
		});
	});

	describe('getPageById', () => {
		test('should return null for invalid ID', async () => {
			const { getPageById } = await import('./wp-fetch');

			const result = await getPageById(-5);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Invalid page ID: -5')
			);
		});

		test('should return null for zero ID', async () => {
			const { getPageById } = await import('./wp-fetch');

			const result = await getPageById(0);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should fetch page from /pages endpoint', async () => {
			const mockPage = {
				id: 42,
				slug: 'about',
				title: { rendered: 'About Us' },
				content: { rendered: '<p>About content</p>' },
				date: '2024-01-01T00:00:00',
				modified: '2024-01-01T00:00:00',
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockPage),
			});

			const { getPageById } = await import('./wp-fetch');
			const result = await getPageById(42);

			expect(global.fetch).toHaveBeenCalledWith(
				`${MOCK_API_URL}/pages/42?_embed`,
				expect.objectContaining({ next: { revalidate: 300 } })
			);
			expect(result).toEqual(mockPage);
		});

		test('should return null on 500 server error', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});

			const { getPageById } = await import('./wp-fetch');
			const result = await getPageById(1);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch page by ID "1": HTTP 500 Internal Server Error')
			);
		});

		test('should return null on network error', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

			const { getPageById } = await import('./wp-fetch');
			const result = await getPageById(42);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Network error fetching page by ID "42"'),
				expect.any(Error)
			);
		});
	});

	describe('getPageBySlug', () => {
		test('should return null for empty slug', async () => {
			const { getPageBySlug } = await import('./wp-fetch');

			const result = await getPageBySlug('');

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				'Empty or invalid slug provided to getPageBySlug'
			);
		});

		test('should return null for whitespace-only slug', async () => {
			const { getPageBySlug } = await import('./wp-fetch');

			const result = await getPageBySlug('   ');

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				'Empty or invalid slug provided to getPageBySlug'
			);
		});

		test('should return null for null/undefined slug', async () => {
			const { getPageBySlug } = await import('./wp-fetch');

			// TypeScript would normally prevent this, but testing runtime behavior
			const result = await getPageBySlug(null as unknown as string);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should URL-encode special characters in slug', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([]),
			});

			const { getPageBySlug } = await import('./wp-fetch');
			await getPageBySlug('page with spaces & special=chars');

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('slug=page%20with%20spaces%20%26%20special%3Dchars'),
				expect.any(Object)
			);
		});

		test('should trim whitespace from slug', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, slug: 'about' }]),
			});

			const { getPageBySlug } = await import('./wp-fetch');
			await getPageBySlug('  about  ');

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('slug=about'),
				expect.any(Object)
			);
		});

		test('should return first item from array response', async () => {
			const mockPages = [
				{ id: 1, slug: 'home', title: { rendered: 'Home' } },
				{ id: 2, slug: 'home-copy', title: { rendered: 'Home Copy' } },
			];

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockPages),
			});

			const { getPageBySlug } = await import('./wp-fetch');
			const result = await getPageBySlug('home');

			expect(result).toEqual(mockPages[0]);
		});

		test('should return null when array is empty', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([]),
			});

			const { getPageBySlug } = await import('./wp-fetch');
			const result = await getPageBySlug('nonexistent-page');

			expect(result).toBeNull();
		});

		test('should return null on 404', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found',
			});

			const { getPageBySlug } = await import('./wp-fetch');
			const result = await getPageBySlug('missing');

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch page by slug "missing": HTTP 404 Not Found')
			);
		});

		test('should return null on network error', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('DNS lookup failed'));

			const { getPageBySlug } = await import('./wp-fetch');
			const result = await getPageBySlug('contact');

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Network error fetching page by slug "contact"'),
				expect.any(Error)
			);
		});
	});

	describe('getPostBySlug', () => {
		test('should return null for empty slug', async () => {
			const { getPostBySlug } = await import('./wp-fetch');

			const result = await getPostBySlug('');

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				'Empty or invalid slug provided to getPostBySlug'
			);
		});

		test('should return null for whitespace-only slug', async () => {
			const { getPostBySlug } = await import('./wp-fetch');

			const result = await getPostBySlug('\t\n  ');

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should URL-encode slug parameter', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([]),
			});

			const { getPostBySlug } = await import('./wp-fetch');
			await getPostBySlug('my-awesome-post!@#');

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('slug=my-awesome-post!%40%23'),
				expect.any(Object)
			);
		});

		test('should fetch post from /posts endpoint with slug', async () => {
			const mockPost = {
				id: 100,
				slug: 'hello-world',
				title: { rendered: 'Hello World' },
				excerpt: { rendered: 'Welcome to our blog' },
				date: '2024-01-01T00:00:00',
				modified: '2024-01-01T00:00:00',
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockPost]),
			});

			const { getPostBySlug } = await import('./wp-fetch');
			const result = await getPostBySlug('hello-world');

			expect(global.fetch).toHaveBeenCalledWith(
				`${MOCK_API_URL}/posts?slug=hello-world&_embed`,
				expect.objectContaining({ next: { revalidate: 300 } })
			);
			expect(result).toEqual(mockPost);
		});

		test('should return null when array is empty', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([]),
			});

			const { getPostBySlug } = await import('./wp-fetch');
			const result = await getPostBySlug('does-not-exist');

			expect(result).toBeNull();
		});

		test('should return null on network error', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Timeout'));

			const { getPostBySlug } = await import('./wp-fetch');
			const result = await getPostBySlug('some-post');

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Network error fetching post by slug "some-post"'),
				expect.any(Error)
			);
		});
	});

	describe('getPosts', () => {
		test('should fetch all posts from /posts endpoint', async () => {
			const mockPosts = [
				{ id: 1, slug: 'post-1', title: { rendered: 'Post 1' } },
				{ id: 2, slug: 'post-2', title: { rendered: 'Post 2' } },
			];

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockPosts),
				headers: {
					get: (key: string) => {
						if (key === 'X-WP-Total') return '2';
						if (key === 'X-WP-TotalPages') return '1';
						return null;
					}
				}
			});

			const { getPosts } = await import('./wp-fetch');
			const result = await getPosts();

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining(`${MOCK_API_URL}/posts?`),
				expect.objectContaining({ next: { revalidate: 60 } })
			);
			expect(result).toMatchObject({
				posts: mockPosts,
				totalPosts: 2,
				totalPages: 1,
				currentPage: 1
			});
		});

		test('should return empty PaginatedPosts on error', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});

			const { getPosts } = await import('./wp-fetch');
			const result = await getPosts();

			expect(result).toEqual({
				posts: [],
				totalPosts: 0,
				totalPages: 0,
				currentPage: 1
			});
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch posts: HTTP 500 Internal Server Error')
			);
		});

		test('should return empty PaginatedPosts on network error', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

			const { getPosts } = await import('./wp-fetch');
			const result = await getPosts();

			expect(result).toEqual({
				posts: [],
				totalPosts: 0,
				totalPages: 0,
				currentPage: 1
			});
		});
	});

	describe('getCategoryById', () => {
		test('should return null for invalid ID', async () => {
			const { getCategoryById } = await import('./wp-fetch');

			const result = await getCategoryById(-1);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Invalid category ID: -1')
			);
		});

		test('should return null for zero ID', async () => {
			const { getCategoryById } = await import('./wp-fetch');

			const result = await getCategoryById(0);

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('should fetch category from /categories endpoint', async () => {
			const mockCategory = {
				id: 5,
				name: 'Technology',
				slug: 'technology',
				count: 10,
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockCategory),
			});

			const { getCategoryById } = await import('./wp-fetch');
			const result = await getCategoryById(5);

			expect(global.fetch).toHaveBeenCalledWith(
				`${MOCK_API_URL}/categories/5`,
				expect.objectContaining({ next: { revalidate: 3600 } })
			);
			expect(result).toEqual(mockCategory);
		});

		test('should return null on 404', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				statusText: 'Not Found',
			});

			const { getCategoryById } = await import('./wp-fetch');
			const result = await getCategoryById(999);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to fetch category by ID "999": HTTP 404 Not Found')
			);
		});

		test('should return null on network error', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Connection reset'));

			const { getCategoryById } = await import('./wp-fetch');
			const result = await getCategoryById(3);

			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Network error fetching category by ID "3"'),
				expect.any(Error)
			);
		});
	});

	describe('Type exports', () => {
		test('should export all required types', async () => {
			const wpFetchModule = await import('./wp-fetch');

			// Check that the module exports the expected functions
			expect(typeof wpFetchModule.getPosts).toBe('function');
			expect(typeof wpFetchModule.getPostById).toBe('function');
			expect(typeof wpFetchModule.getPageById).toBe('function');
			expect(typeof wpFetchModule.getPageBySlug).toBe('function');
			expect(typeof wpFetchModule.getPostBySlug).toBe('function');
			expect(typeof wpFetchModule.getCategoryById).toBe('function');
		});
	});
});
