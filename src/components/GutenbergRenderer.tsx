// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import { normalizeBlockName } from '../lib/normalize-block-name';
import parse from 'html-react-parser';

interface GutenbergBlock {
    blockName: string | null;
    attrs: Record<string, any>;
    innerBlocks: GutenbergBlock[];
    innerContent: string[];
}

interface GutenbergRendererProps {
    blocks: GutenbergBlock[];
}

export function GutenbergRenderer({ blocks }: GutenbergRendererProps) {

    const renderBlock = (block: GutenbergBlock, index: number) => {
        if (!block.blockName) {
            return null;
        }

        const normalizedName = normalizeBlockName(block.blockName);
        const BlockComponent = getBlockComponent(block.blockName);

        if (BlockComponent) {
            const { attrs, innerBlocks, innerContent } = block;

            // Filter backend-specific attributes
            const filteredAttrs = Object.fromEntries(
                Object.entries(attrs).filter(([key]) => !['lock', 'metadata'].includes(key))
            );

            // Leaf blocks get children from innerContent; containers get innerBlocks
            const isLeafBlock = innerBlocks.length === 0;
            const props: Record<string, any> = {
                ...filteredAttrs
            };

            return (
                <BlockComponent key={`${block.blockName}-${index}`} {...props}>
                {
                    !isLeafBlock
                        ? <GutenbergRenderer blocks={innerBlocks} />
                        : innerContent?.[0] && (
                            parse( innerContent[0] )
                        )
                }
                </BlockComponent>
            );
        }
        return null;
    };

    return (
        <>
            {blocks.map((block, index) => renderBlock(block, index))}
        </>
    );
}