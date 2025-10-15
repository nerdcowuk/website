// src/lib/normalize-block-name.ts
export function normalizeBlockName(blockName: string): string {
  // Remove namespace (e.g., 'custom/' or 'core/'), split by '-', capitalize each part
  const nameParts = blockName.split('/').pop()?.split(/[-_]/) || [];
  return nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

// Examples:
// 'custom/hero' → 'Hero'
// 'core/paragraph' → 'Paragraph'
// 'acme/testimonial-block' → 'TestimonialBlock'