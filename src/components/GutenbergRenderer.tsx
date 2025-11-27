// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';
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

// Inline text elements that should be wrapped in Text component
const INLINE_TEXT_ELEMENTS = ['a', 'strong', 'em', 'span', 'b', 'i', 'u', 'mark', 'code', 'small', 'sub', 'sup'];

// Extract inner content from HTML string for text blocks
function extractTextContent(innerHTML: string): React.ReactNode {
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (!(domNode instanceof Element)) return;

            // If it's the root element (ncos-text), extract only its children
            if (domNode.attribs?.class?.includes('ncos-text')) {
                return <>{domToReact(domNode.children as any, options)}</>;
            }

            // Wrap inline text elements in Text component
            if (INLINE_TEXT_ELEMENTS.includes(domNode.name)) {
                const { class: className, ...otherAttribs } = domNode.attribs || {};

                // Filter out ncos-text classes from inline elements, preserve custom classes
                const filteredClassName = className
                    ?.split(' ')
                    .filter((cls: string) => !cls.includes('ncos-text'))
                    .join(' ') || undefined;

                return (
                    <Text
                        as={domNode.name}
                        className={filteredClassName}
                        {...otherAttribs}
                    >
                        {domToReact(domNode.children as DOMNode[], options)}
                    </Text>
                );
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