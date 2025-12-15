import type { NextConfig } from "next";
import type { Configuration, RuleSetRule } from 'webpack';

const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
	webpack(config: Configuration) {
		const fileLoaderRule = config.module?.rules?.find((rule) => {
			if (typeof rule === 'object' && rule !== null && 'test' in rule) {
				const ruleAsAny = rule as RuleSetRule;
				return ruleAsAny.test instanceof RegExp && ruleAsAny.test.test('.svg');
			}
			return false;
		}) as RuleSetRule | undefined;

		if (!fileLoaderRule || !config.module?.rules) {
			return config;
		}

		config.module.rules.push(
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: /url/ }, // exclude if *.svg?url
				use: [
					{
						loader: "@svgr/webpack",
						options: {
							svgo: false,
							titleProp: true,
							ref: true,
						},
					},
				],
			}
		);

		fileLoaderRule.exclude = /\.svg$/i;

		return config;
	},
};

export default nextConfig;