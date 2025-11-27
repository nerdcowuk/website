// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';
import Text from './blocks/Text/Text';

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
// Recursively applies Text component to nested inline elements
function extractTextContent(innerHTML: string): React.ReactNode {
    // Inline elements that should be wrapped with Text component
    const inlineElements = ['a', 'strong', 'em', 'span', 'b', 'i', 'u', 'mark', 'code', 'abbr', 'cite', 'del', 'ins', 'kbd', 'sub', 'sup', 's', 'small'];

    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element) {
                // If it's the root element (ncos-text), recursively process its children
                if (domNode.attribs?.class?.includes('ncos-text')) {
                    return <>{domToReact(domNode.children as any, options)}</>;
                }

                // For inline elements, wrap them in Text component
                if (inlineElements.includes(domNode.name)) {
                    // Extract props from attributes
                    const { class: className, ...otherAttribs } = domNode.attribs || {};

                    return (
                        <Text as={domNode.name} className={className} {...otherAttribs}>
                            {domToReact(domNode.children as any, options)}
                        </Text>
                    );
                }
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
            } else if (block.name === 'ncos/text' && block.innerHTML) {
                // Text blocks: extract inner content from innerHTML
                children = extractTextContent(block.innerHTML);
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