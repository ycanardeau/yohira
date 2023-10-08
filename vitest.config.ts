import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@yohira/authentication': resolve(
				__dirname,
				'./packages/authentication/src',
			),
			'@yohira/authentication.abstractions': resolve(
				__dirname,
				'./packages/authentication.abstractions/src',
			),
			'@yohira/authentication.cookies': resolve(
				__dirname,
				'./packages/authentication.cookies/src',
			),
			'@yohira/authentication.core': resolve(
				__dirname,
				'./packages/authentication.core/src',
			),
			'@yohira/base': resolve(__dirname, './packages/base/src'),
			'@yohira/cryptography': resolve(
				__dirname,
				'./packages/cryptography/src',
			),
			'@yohira/data-protection': resolve(
				__dirname,
				'./packages/data-protection/src',
			),
			'@yohira/data-protection.abstractions': resolve(
				__dirname,
				'./packages/data-protection.abstractions/src',
			),
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
			'@yohira/extensions.hosting.abstractions': resolve(
				__dirname,
				'./packages/extensions.hosting.abstractions/src',
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
			'@yohira/extensions.primitives': resolve(
				__dirname,
				'./packages/extensions.primitives/src',
			),
			'@yohira/extensions.web-encoders': resolve(
				__dirname,
				'./packages/extensions.web-encoders/src',
			),
			'@yohira/hosting': resolve(__dirname, './packages/hosting/src'),
			'@yohira/hosting.abstractions': resolve(
				__dirname,
				'./packages/hosting.abstractions/src',
			),
			'@yohira/hosting.server.abstractions': resolve(
				__dirname,
				'./packages/hosting.server.abstractions/src',
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
			'@yohira/http.headers': resolve(
				__dirname,
				'./packages/http.headers/src',
			),
			'@yohira/http.shared': resolve(
				__dirname,
				'./packages/http.shared/src',
			),
			'@yohira/routing': resolve(__dirname, './packages/routing/src'),
			'@yohira/server.node.core': resolve(
				__dirname,
				'./packages/server.node.core/src',
			),
			'@yohira/shared': resolve(__dirname, './packages/shared/src'),
			'@yohira/third-party.inversify': resolve(
				__dirname,
				'./packages/third-party.inversify/src',
			),
			'@yohira/third-party.ts-results': resolve(
				__dirname,
				'./packages/third-party.ts-results/src',
			),
			'@yohira/xml': resolve(__dirname, './packages/xml/src'),
		},
	},
});
