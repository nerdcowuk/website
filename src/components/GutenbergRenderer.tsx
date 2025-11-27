// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';

interface GutenbergBlock {
    name: string;
    attrs: Record<string, any>;
    innerBlocks: GutenbergBlock[];
    innerHTML: string;
}

interface GutenbergRendererProps {
    blocks: GutenbergBlock[];
}

// Extract inner content from HTML string for text blocks
function extractTextContent(innerHTML: string): React.ReactNode {
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            // Remove empty class attributes from all elements
            if (domNode instanceof Element && domNode.attribs?.class === '') {
                const { class: _, ...restAttribs } = domNode.attribs;
                domNode.attribs = restAttribs;
            }
        }
    };

    return parse(innerHTML, options);
}

export function GutenbergRenderer({ blocks }: GutenbergRendererProps) {
    const renderBlock = (block: GutenbergBlock, index: number): React.ReactNode => {
        if (!block.name) {
            return null;
        }

        // Special handling for text blocks - render innerHTML directly to preserve WordPress classes
        if (block.name === 'ncos/text' && block.innerHTML) {
            return <div key={`${block.name}-${index}`}>{extractTextContent(block.innerHTML)}</div>;
        }

        const BlockComponent = getBlockComponent(block.name);

        if (BlockComponent) {
            const { attrs, innerBlocks } = block;

            // Filter out backend-only attrs
            const filteredAttrs = Object.fromEntries(
                Object.entries(attrs).filter(([key]) => !['lock', 'metadata'].includes(key))
            );

            const isLeafBlock = innerBlocks.length === 0;

            // Determine children based on block type
            let children: React.ReactNode = null;

            if (!isLeafBlock) {
                // Has inner blocks - render them recursively
                children = <GutenbergRenderer blocks={innerBlocks} />;
            } else if (attrs.children) {
                // Use attrs.children if available (e.g., for buttons)
                children = attrs.children;
            }

            return (
                <BlockComponent key={`${block.name}-${index}`} {...filteredAttrs}>
                    {children}
                </BlockComponent>
            );
        }

        // Fallback for unknown blocks - render innerHTML directly
        return block.innerHTML ? <div key={`${block.name}-${index}`}>{parse(block.innerHTML)}</div> : null;
    };

    return (
        <>
            {blocks.map((block, index) => renderBlock(block, index))}
        </>
    );
}