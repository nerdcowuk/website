import dynamic from 'next/dynamic';
import { normalizeBlockName } from './normalize-block-name';
import { ComponentType } from 'react';

/**
 * Mapping normalized block names to local React components.
 * For example, "Section" comes from "ncos/section" in WordPress
 * and maps to the "Box" component in the app.
 */
const blockComponents: Record<string, ComponentType<any>> = {
	Section: dynamic(() => import('@/components/blocks/Box/Box').then(mod => mod.default), { ssr: false }),
	Text: dynamic(() => import('@/components/blocks/Text/Text').then(mod => mod.default), { ssr: false }),
	Stack: dynamic(() => import('@/components/blocks/Stack/Stack').then(mod => mod.default), { ssr: false }),
	Button: dynamic(() => import('@/components/blocks/Button/Button').then(mod => mod.default), { ssr: false }),
	Media: dynamic(() => import('@/components/blocks/Media/Media').then(mod => mod.default), { ssr: false }),
	List: dynamic(() => import('@/components/blocks/List/List').then(mod => mod.default), { ssr: false }),
	ListItem: dynamic(() => import('@/components/blocks/ListItem/ListItem').then(mod => mod.default), { ssr: false }),
	Divider: dynamic(() => import('@/components/blocks/Divider/Divider').then(mod => mod.default), { ssr: false }),
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
