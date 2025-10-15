// src/lib/block-registry.ts
import dynamic from 'next/dynamic';
import { normalizeBlockName } from '../lib/normalize-block-name';

// Pre-define all possible block components (or auto-discover)
const blockComponents = {
  Section: dynamic(() => import('@/components/blocks/Section')),
  // Add more as you create them
  // Core blocks can use simple HTML fallbacks
};

// Auto-discovery helper (optional)
function getBlockComponent(blockName: string) {
  console.log('🔍 Original blockName:', blockName);
  
  const normalized = normalizeBlockName(blockName);
  console.log('🔍 Normalized:', normalized);
  console.log('🔍 Available components:', Object.keys(blockComponents));
  
  const component = blockComponents[normalized as keyof typeof blockComponents];
  console.log('🔍 Found component:', !!component, normalized);
  
  return component || null;
}

export { blockComponents, getBlockComponent };