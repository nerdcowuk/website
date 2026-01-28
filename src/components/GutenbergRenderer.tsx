// src/components/GutenbergRenderer.tsx
'use client';

import { getBlockComponent } from '../lib/block-registry';
import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';
import Text from '@/components/primitives/Text';
import Icon from '@/components/primitives/Icon';
import ExternalIcon from '@/components/primitives/Icon/svg/external.svg';
import styles from '@/components/primitives/Text/Text.module.scss';
import { sanitizeBlockHtml } from '@/lib/wordpress/sanitize';
import { BlockErrorBoundary } from '@/components/BlockErrorBoundary';
import type { GutenbergBlock } from '@/types';

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
                    const { class: className, target, ...otherAttribs } = domNode.attribs || {};
                    
                    const children = domToReact(domNode.children as any, options);
                    
                    // Check if it's an external link
                    const isExternalLink = domNode.name === 'a' && target === '_blank';

                    return (
                        <Text as={domNode.name} className={className} target={target} {...otherAttribs}>
                            {children}
                            {isExternalLink && (
                                <Icon icon={ExternalIcon} className={styles['external']}/>
                            )}
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
                // Extract id from the root element if present
                const idMatch = block.innerHTML.match(/\sid="([^"]*)"/);
                
                // Text blocks: extract inner content from innerHTML
                children = extractTextContent(block.innerHTML);
                
                // If id exists, append the link to children
                if (idMatch) {
                    filteredAttrs.id = idMatch[1];
                    children = (
                        <>
                            <a href={`#${idMatch[1]}`} className={styles['anchor']}>#</a>
                            {children}
                        </>
                    );
                }
            } else if (block.name === 'core/list-item' && block.innerHTML) {
                // Strip the outer <li> tags and extract inner content
                const innerContent = block.innerHTML.replace(/^\s*<li[^>]*>(.*)<\/li>\s*$/, '$1');
                children = extractTextContent(innerContent);
            } else if (attrs.children !== undefined && attrs.children !== null) {
                // Use attrs.children if available (e.g., for buttons)
                // Cast to ReactNode since block attributes are typed as unknown
                children = attrs.children as React.ReactNode;
            }

            return (
                <BlockErrorBoundary key={`${block.name}-${index}`} blockName={block.name}>
                    <BlockComponent {...filteredAttrs}>
                        {children}
                    </BlockComponent>
                </BlockErrorBoundary>
            );
        }

        // Fallback for unknown blocks - render innerHTML with sanitization for security
        if (block.innerHTML) {
            return (
                <BlockErrorBoundary key={`${block.name}-${index}`} blockName={block.name}>
                    <div>{parse(sanitizeBlockHtml(block.innerHTML))}</div>
                </BlockErrorBoundary>
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