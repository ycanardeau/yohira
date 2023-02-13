import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@yohira/base': resolve(__dirname, './packages/base/src'),
			'@yohira/extensions.config': resolve(
				__dirname,
				'./packages/extensions.config/src',
			),
			'@yohira/extensions.config.abstractions': resolve(
				__dirname,
				'./packages/extensions.config.abstractions/src',
			),
			'@yohira/extensions.config.binder': resolve(
				__dirname,
				'./packages/extensions.config.binder/src',
			),
			'@yohira/extensions.config.env-variables': resolve(
				__dirname,
				'./packages/extensions.config.env-variables/src',
			),
			'@yohira/extensions.config.file-extensions': resolve(
				__dirname,
				'./packages/extensions.config.file-extensions/src',
			),
			'@yohira/extensions.config.json': resolve(
				__dirname,
				'./packages/extensions.config.json/src',
			),
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
			'@yohira/extensions.features': resolve(
				__dirname,
				'./packages/extensions.features/src',
			),
			'@yohira/extensions.file-providers': resolve(
				__dirname,
				'./packages/extensions.file-providers/src',
			),
			'@yohira/extensions.logging': resolve(
				__dirname,
				'./packages/extensions.logging/src',
			),
			'@yohira/extensions.logging.abstractions': resolve(
				__dirname,
				'./packages/extensions.logging.abstractions/src',
			),
			'@yohira/extensions.options': resolve(
				__dirname,
				'./packages/extensions.options/src',
			),
			'@yohira/extensions.options.config-extensions': resolve(
				__dirname,
				'./packages/extensions.options.config-extensions/src',
			),
			'@yohira/http': resolve(__dirname, './packages/http/src'),
			'@yohira/http.abstractions': resolve(
				__dirname,
				'./packages/http.abstractions/src',
			),
			'@yohira/http.features': resolve(
				__dirname,
				'./packages/http.features/src',
			),
			'@yohira/routing': resolve(__dirname, './packages/routing/src'),
			'@yohira/third-party.inversify': resolve(
				__dirname,
				'./packages/third-party.inversify/src',
			),
			'@yohira/third-party.ts-results': resolve(
				__dirname,
				'./packages/third-party.ts-results/src',
			),
		},
	},
});
