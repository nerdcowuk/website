// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import { normalizeBlockName } from '../lib/normalize-block-name';

interface GutenbergBlock {
  name: string;
  attrs: Record<string, any>;
  innerBlocks: GutenbergBlock[];
  innerHTML: string;
}

interface GutenbergRendererProps {
  blocks: GutenbergBlock[];
}

// Fallback for unknown blocks
const DefaultBlock = ({ innerHTML, attrs }: { innerHTML: string; attrs?: any }) => (
  <div className={attrs?.className} dangerouslySetInnerHTML={{ __html: innerHTML }} />
);

export function GutenbergRenderer({ blocks }: GutenbergRendererProps) {
  const renderBlock = (block: GutenbergBlock, index: number) => {
    const normalizedName = normalizeBlockName(block.name);
    const BlockComponent = getBlockComponent(block.name);
    
    if (BlockComponent) {
      console.log(`✅ Rendering ${normalizedName} with React component`);
      return (
        <BlockComponent
          key={`${block.name}-${index}`}
          {...block.attrs}
          innerBlocks={block.innerBlocks}
        >
          {block.innerHTML && (
            <div dangerouslySetInnerHTML={{ __html: block.innerHTML }} />
          )}
        </BlockComponent>
      );
    }
    
    console.warn(`⚠️ No React component for ${block.name}, using HTML fallback`);
    return (
      <DefaultBlock
        key={`${block.name}-${index}`}
        innerHTML={block.innerHTML}
        attrs={block.attrs}
      />
    );
  };

  return (
    <div className="gutenberg-content">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}