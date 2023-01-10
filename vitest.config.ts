import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@yohira/base': resolve(__dirname, './packages/base/src'),
			'@yohira/extensions.dependency-injection': resolve(
				__dirname,
				'./packages/extensions.dependency-injection/src',
			),
			'@yohira/extensions.dependency-injection.abstractions': resolve(
				__dirname,
				'./packages/extensions.dependency-injection.abstractions/src',
			),
			'@yohira/extensions.dependency-injection.specification.tests':
				resolve(
					__dirname,
					'./packages/extensions.dependency-injection.specification.tests/src',
				),
			'@yohira/extensions.options': resolve(
				__dirname,
				'./packages/extensions.options/src',
			),
			'@yohira/third-party.inversify': resolve(
				__dirname,
				'./packages/third-party.inversify/src',
			),
		},
	},
});
