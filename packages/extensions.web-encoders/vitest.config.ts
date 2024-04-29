import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@yohira/antiforgery': resolve(__dirname, '../antiforgery/src'),
			'@yohira/authentication': resolve(
				__dirname,
				'../authentication/src',
			),
			'@yohira/authentication.abstractions': resolve(
				__dirname,
				'../authentication.abstractions/src',
			),
			'@yohira/authentication.cookies': resolve(
				__dirname,
				'../authentication.cookies/src',
			),
			'@yohira/authentication.core': resolve(
				__dirname,
				'../authentication.core/src',
			),
			'@yohira/base': resolve(__dirname, '../base/src'),
			'@yohira/cryptography': resolve(__dirname, '../cryptography/src'),
			'@yohira/data-protection': resolve(
				__dirname,
				'../data-protection/src',
			),
			'@yohira/data-protection.abstractions': resolve(
				__dirname,
				'../data-protection.abstractions/src',
			),
			'@yohira/extensions.config': resolve(
				__dirname,
				'../extensions.config/src',
			),
			'@yohira/extensions.config.abstractions': resolve(
				__dirname,
				'../extensions.config.abstractions/src',
			),
			'@yohira/extensions.config.binder': resolve(
				__dirname,
				'../extensions.config.binder/src',
			),
			'@yohira/extensions.config.env-variables': resolve(
				__dirname,
				'../extensions.config.env-variables/src',
			),
			'@yohira/extensions.config.file-extensions': resolve(
				__dirname,
				'../extensions.config.file-extensions/src',
			),
			'@yohira/extensions.config.json': resolve(
				__dirname,
				'../extensions.config.json/src',
			),
			'@yohira/extensions.dependency-injection': resolve(
				__dirname,
				'../extensions.dependency-injection/src',
			),
			'@yohira/extensions.dependency-injection.abstractions': resolve(
				__dirname,
				'../extensions.dependency-injection.abstractions/src',
			),
			'@yohira/extensions.dependency-injection.specification.tests':
				resolve(
					__dirname,
					'../extensions.dependency-injection.specification.tests/src',
				),
			'@yohira/extensions.features': resolve(
				__dirname,
				'../extensions.features/src',
			),
			'@yohira/extensions.file-providers': resolve(
				__dirname,
				'../extensions.file-providers/src',
			),
			'@yohira/extensions.hosting': resolve(
				__dirname,
				'../extensions.hosting/src',
			),
			'@yohira/extensions.hosting.abstractions': resolve(
				__dirname,
				'../extensions.hosting.abstractions/src',
			),
			'@yohira/extensions.logging': resolve(
				__dirname,
				'../extensions.logging/src',
			),
			'@yohira/extensions.logging.abstractions': resolve(
				__dirname,
				'../extensions.logging.abstractions/src',
			),
			'@yohira/extensions.options': resolve(
				__dirname,
				'../extensions.options/src',
			),
			'@yohira/extensions.options.config-extensions': resolve(
				__dirname,
				'../extensions.options.config-extensions/src',
			),
			'@yohira/extensions.primitives': resolve(
				__dirname,
				'../extensions.primitives/src',
			),
			'@yohira/extensions.web-encoders': resolve(
				__dirname,
				'../extensions.web-encoders/src',
			),
			'@yohira/hosting': resolve(__dirname, '../hosting/src'),
			'@yohira/hosting.abstractions': resolve(
				__dirname,
				'../hosting.abstractions/src',
			),
			'@yohira/hosting.server.abstractions': resolve(
				__dirname,
				'../hosting.server.abstractions/src',
			),
			'@yohira/http': resolve(__dirname, '../http/src'),
			'@yohira/http.abstractions': resolve(
				__dirname,
				'../http.abstractions/src',
			),
			'@yohira/http.extensions': resolve(
				__dirname,
				'../http.extensions/src',
			),
			'@yohira/http.features': resolve(__dirname, '../http.features/src'),
			'@yohira/http.headers': resolve(__dirname, '../http.headers/src'),
			'@yohira/http.shared': resolve(__dirname, '../http.shared/src'),
			'@yohira/https-policy': resolve(__dirname, '../https-policy/src'),
			'@yohira/mvc.abstractions': resolve(
				__dirname,
				'../mvc.abstractions/src',
			),
			'@yohira/mvc.core': resolve(__dirname, './.packages/mvc.core/src'),
			'@yohira/routing': resolve(__dirname, '../routing/src'),
			'@yohira/server.node.core': resolve(
				__dirname,
				'../server.node.core/src',
			),
			'@yohira/shared': resolve(__dirname, '../shared/src'),
			'@yohira/test-host': resolve(__dirname, '../test-host/src'),
			'@yohira/testing': resolve(__dirname, '../testing/src'),
			'@yohira/third-party.inversify': resolve(
				__dirname,
				'../third-party.inversify/src',
			),
			'@yohira/third-party.ts-results': resolve(
				__dirname,
				'../third-party.ts-results/src',
			),
			'@yohira/xml': resolve(__dirname, '../xml/src'),
		},
	},
	test: {
		passWithNoTests: true
	}
});
