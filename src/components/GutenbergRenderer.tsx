// src/components/GutenbergRenderer.tsx
'use client';

import React from 'react';
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

// Extract tag, classes, and content from text block innerHTML
function extractTextBlockData(innerHTML: string): { tag: string; className: string; content: React.ReactNode } | null {
    const parsedElement = parse(innerHTML);

    // If we got a single React element, extract its props
    if (React.isValidElement(parsedElement)) {
        const element = parsedElement as React.ReactElement;
        return {
            tag: typeof element.type === 'string' ? element.type : 'p',
            className: element.props.className || '',
            content: element.props.children
        };
    }

    return null;
}

export function GutenbergRenderer({ blocks }: GutenbergRendererProps) {
    const renderBlock = (block: GutenbergBlock, index: number): React.ReactNode => {
        if (!block.name) {
            return null;
        }

        // Special handling for text blocks - extract WordPress classes and pass to Text component
        if (block.name === 'ncos/text' && block.innerHTML) {
            const textData = extractTextBlockData(block.innerHTML);
            if (textData) {
                const BlockComponent = getBlockComponent(block.name);
                if (BlockComponent) {
                    return (
                        <BlockComponent
                            key={`${block.name}-${index}`}
                            tag={textData.tag}
                            className={textData.className}
                        >
                            {textData.content}
                        </BlockComponent>
                    );
                }
            }
            // Fallback if extraction fails
            return <React.Fragment key={`${block.name}-${index}`}>{parse(block.innerHTML)}</React.Fragment>;
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