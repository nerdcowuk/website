import dynamic from 'next/dynamic';
import { normalizeBlockName } from './normalize-block-name';
import { ComponentType } from 'react';

/**
 * Mapping normalized block names to local React components.
 * For example, "Section" comes from "ncos/section" in WordPress
 * and maps to the "Box" component in the app.
 */
const blockComponents: Record<string, ComponentType<any>> = {
	Section: dynamic(() => import('@/components/blocks/Box').then(mod => mod.default), { ssr: false }),
	Text: dynamic(() => import('@/components/blocks/Text').then(mod => mod.default), { ssr: false }),
	Stack: dynamic(() => import('@/components/blocks/Stack').then(mod => mod.default), { ssr: false }),
	Button: dynamic(() => import('@/components/blocks/Button').then(mod => mod.default), { ssr: false }),
};

/**
 * Returns a React component corresponding to a Gutenberg block name.
 */
export function getBlockComponent(blockName: string | null): ComponentType<any> | null {
	if (!blockName) return null;
	const normalized = normalizeBlockName(blockName);
	const component = blockComponents[normalized];
	return component ?? null;
}

export { blockComponents };
