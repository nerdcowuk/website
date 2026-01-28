import { GutenbergRenderer } from '@/components/GutenbergRenderer';
import { getPageById } from '@/lib/wp-fetch';

export default async function HomePage() {
	const page = await getPageById(4696);
		
	if (!page || !page.blocks) {
		return <div>Failed to load homepage</div>;
	}

	return <GutenbergRenderer blocks={page.blocks} />;
}