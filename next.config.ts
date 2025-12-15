import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
	webpack(config) {
		const fileLoaderRule = config.module.rules.find((rule: any) =>
			rule.test instanceof RegExp && rule.test.test('.svg')
		);

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