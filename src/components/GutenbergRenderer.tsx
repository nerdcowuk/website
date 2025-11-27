// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import { normalizeBlockName } from '../lib/normalize-block-name';
import parse from 'html-react-parser';

interface GutenbergBlock {
    name: string;
    attrs: Record<string, any>;
    innerBlocks: GutenbergBlock[];
    innerHTML: string;
}

interface GutenbergRendererProps {
    blocks: GutenbergBlock[];
}

export function GutenbergRenderer({ blocks }: GutenbergRendererProps) {
    const renderBlock = (block: GutenbergBlock, index: number): React.ReactNode => {
        if (!block.name) {
            return null;
        }

        const normalizedName = normalizeBlockName(block.name); // ← now uses block.name
        const BlockComponent = getBlockComponent(block.name);

        if (BlockComponent) {
            const { attrs, innerBlocks } = block;

            // Filter out backend-only attrs (your original logic)
            const filteredAttrs = Object.fromEntries(
                Object.entries(attrs).filter(([key]) => !['lock', 'metadata'].includes(key))
            );

            const isLeafBlock = innerBlocks.length === 0;

            return (
                <BlockComponent key={`${block.name}-${index}`} {...filteredAttrs}>
                    {!isLeafBlock ? (
                        <GutenbergRenderer blocks={innerBlocks} />
                    ) : block.innerHTML ? (
                        parse(block.innerHTML)   // ← your parse() stays exactly where you had it
                    ) : null}
                </BlockComponent>
            );
        }

        // Fallback for unknown blocks – still uses your beloved parse()
        return block.innerHTML ? parse(block.innerHTML) : null;
    };

    return (
        <>
            {blocks.map((block, index) => renderBlock(block, index))}
        </>
    );
}