export function normalizeBlockName(blockName: string | null): string {
	if (!blockName) return '';
	const nameParts = blockName.split('/').pop()?.split(/[-_]/) || [];
	return nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

// Examples:
// 'custom/hero' → 'Hero'
// 'core/paragraph' → 'Paragraph'
// 'acme/testimonial-block' → 'TestimonialBlock'