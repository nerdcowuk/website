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

// Parse attributes and className from WordPress HTML for text blocks
function parseTextAttributes(innerHTML: string): Record<string, any> {
    const match = innerHTML.match(/class="([^"]*)"/);
    if (!match) return {};

    const classNames = match[1];
    const classes = classNames.split(' ');
    const attrs: Record<string, any> = {
        className: classNames // Preserve all class names
    };

    for (const cls of classes) {
        // Parse align attribute: ncos-text--align-{value}
        const alignMatch = cls.match(/^ncos-text--align-(.+)$/);
        if (alignMatch) {
            attrs.align = alignMatch[1];
        }

        // Parse tag attribute: ncos-text--tag-{value}
        const tagMatch = cls.match(/^ncos-text--tag-(.+)$/);
        if (tagMatch) {
            attrs.tag = tagMatch[1];
        }

        // Parse preset attribute: ncos-text--preset-{value}
        const presetMatch = cls.match(/^ncos-text--preset-(.+)$/);
        if (presetMatch) {
            attrs.preset = presetMatch[1];
        }
    }

    return attrs;
}

// Extract inner content from HTML string for text blocks
function extractTextContent(innerHTML: string): React.ReactNode {
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            // If it's the root element (ncos-text), extract only its children
            if (domNode instanceof Element && domNode.attribs?.class?.includes('ncos-text')) {
                return <>{domToReact(domNode.children as any, options)}</>;
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
            let filteredAttrs = Object.fromEntries(
                Object.entries(attrs).filter(([key]) => !['lock', 'metadata'].includes(key))
            );

            // For text blocks, parse attributes from HTML classes if attrs are empty
            if (block.name === 'ncos/text' && block.innerHTML) {
                const parsedAttrs = parseTextAttributes(block.innerHTML);
                filteredAttrs = { ...parsedAttrs, ...filteredAttrs };
            }

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