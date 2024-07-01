module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'boundaries'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:boundaries/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.cjs'],
	settings: {
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
		'boundaries/elements': [
			{
				type: '@yohira/antiforgery',
				pattern: 'packages/antiforgery/*',
			},
			{
				type: '@yohira/app',
				pattern: 'packages/app/*',
			},
			{
				type: '@yohira/authentication',
				pattern: 'packages/authentication/*',
			},
			{
				type: '@yohira/authentication.abstractions',
				pattern: 'packages/authentication.abstractions/*',
			},
			{
				type: '@yohira/authentication.cookies',
				pattern: 'packages/authentication.cookies/*',
			},
			{
				type: '@yohira/authentication.core',
				pattern: 'packages/authentication.core/*',
			},
			{
				type: '@yohira/base',
				pattern: 'packages/base/*',
			},
			{
				type: '@yohira/core',
				pattern: 'packages/core/*',
			},
			{
				type: '@yohira/cryptography',
				pattern: 'packages/cryptography/*',
			},
			{
				type: '@yohira/data-protection',
				pattern: 'packages/data-protection/*',
			},
			{
				type: '@yohira/data-protection.abstractions',
				pattern: 'packages/data-protection.abstractions/*',
			},
			{
				type: '@yohira/diagnostics',
				pattern: 'packages/diagnostics/*',
			},
			{
				type: '@yohira/extensions.caching.abstractions',
				pattern: 'packages/extensions.caching.abstractions/*',
			},
			{
				type: '@yohira/extensions.caching.memory',
				pattern: 'packages/extensions.caching.memory/*',
			},
			{
				type: '@yohira/extensions.config',
				pattern: 'packages/extensions.config/*',
			},
			{
				type: '@yohira/extensions.config.abstractions',
				pattern: 'packages/extensions.config.abstractions/*',
			},
			{
				type: '@yohira/extensions.config.builder',
				pattern: 'packages/extensions.config.builder/*',
			},
			{
				type: '@yohira/extensions.config.env-variables',
				pattern: 'packages/extensions.config.env-variables/*',
			},
			{
				type: '@yohira/extensions.config.file-extensions',
				pattern: 'packages/extensions.config.file-extensions/*',
			},
			{
				type: '@yohira/extensions.config.json',
				pattern: 'packages/extensions.config.json/*',
			},
			{
				type: '@yohira/extensions.dependency-injection',
				pattern: 'packages/extensions.dependency-injection/*',
			},
			{
				type: '@yohira/extensions.dependency-injection.abstractions',
				pattern:
					'packages/extensions.dependency-injection.abstractions/*',
			},
			{
				type: '@yohira/extensions.dependency-injection.specification.tests',
				pattern:
					'packages/extensions.dependency-injection.specification.tests/*',
			},
			{
				type: '@yohira/extensions.features',
				pattern: 'packages/extensions.features/*',
			},
			{
				type: '@yohira/extensions.file-providers',
				pattern: 'packages/extensions.file-providers/*',
			},
			{
				type: '@yohira/extensions.hosting',
				pattern: 'packages/extensions.hosting/*',
			},
			{
				type: '@yohira/extensions.hosting.abstractions',
				pattern: 'packages/extensions.hosting.abstractions/*',
			},
			{
				type: '@yohira/extensions.logging',
				pattern: 'packages/extensions.logging/*',
			},
			{
				type: '@yohira/extensions.logging.abstractions',
				pattern: 'packages/extensions.logging.abstractions/*',
			},
			{
				type: '@yohira/extensions.options',
				pattern: 'packages/extensions.options/*',
			},
			{
				type: '@yohira/extensions.options.config-extensions',
				pattern: 'packages/extensions.options.config-extensions/*',
			},
			{
				type: '@yohira/extensions.primitives',
				pattern: 'packages/extensions.primitives/*',
			},
			{
				type: '@yohira/extensions.web-encoders',
				pattern: 'packages/extensions.web-encoders/*',
			},
			{
				type: '@yohira/hosting',
				pattern: 'packages/hosting/*',
			},
			{
				type: '@yohira/hosting.abstractions',
				pattern: 'packages/hosting.abstractions/*',
			},
			{
				type: '@yohira/hosting.server.abstractions',
				pattern: 'packages/hosting.server.abstractions/*',
			},
			{
				type: '@yohira/http',
				pattern: 'packages/http/*',
			},
			{
				type: '@yohira/http-logging',
				pattern: 'packages/http-logging/*',
			},
			{
				type: '@yohira/http.abstractions',
				pattern: 'packages/http.abstractions/*',
			},
			{
				type: '@yohira/http.extensions',
				pattern: 'packages/http.extensions/*',
			},
			{
				type: '@yohira/http.features',
				pattern: 'packages/http.features/*',
			},
			{
				type: '@yohira/http.headers',
				pattern: 'packages/http.headers/*',
			},
			{
				type: '@yohira/http.shared',
				pattern: 'packages/http.shared/*',
			},
			{
				type: '@yohira/https-policy',
				pattern: 'packages/https-policy/*',
			},
			{
				type: '@yohira/mvc.abstractions',
				pattern: 'packages/mvc.abstractions/*',
			},
			{
				type: '@yohira/mvc.core',
				pattern: 'packages/mvc.core/*',
			},
			{
				type: '@yohira/routing',
				pattern: 'packages/routing/*',
			},
			{
				type: '@yohira/server.node',
				pattern: 'packages/server.node/*',
			},
			{
				type: '@yohira/server.node.core',
				pattern: 'packages/server.node.core/*',
			},
			{
				type: '@yohira/session',
				pattern: 'packages/session/*',
			},
			{
				type: '@yohira/shared',
				pattern: 'packages/shared/*',
			},
			{
				type: '@yohira/static-files',
				pattern: 'packages/static-files/*',
			},
			{
				type: '@yohira/test-host',
				pattern: 'packages/test-host/*',
			},
			{
				type: '@yohira/testing',
				pattern: 'packages/testing/*',
			},
			{
				type: '@yohira/third-party.inversify',
				pattern: 'packages/third-party.inversify/*',
			},
			{
				type: '@yohira/third-party.mediatr',
				pattern: 'packages/third-party.mediatr/*',
			},
			{
				type: '@yohira/third-party.ts-results',
				pattern: 'packages/third-party.ts-results/*',
			},
			{
				type: '@yohira/xml',
				pattern: 'packages/xml/*',
			},
		],
	},
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'boundaries/element-types': [
			2,
			{
				default: 'disallow',
				rules: [
					{
						from: '@yohira/antiforgery',
						allow: [
							'@yohira/cryptography',
							'@yohira/data-protection',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/extensions.primitives',
							'@yohira/http.abstractions',
							'@yohira/http.headers',
							'@yohira/http.shared',
						],
					},
					{
						from: '@yohira/app',
						allow: [
							'@yohira/antiforgery',
							'@yohira/authentication',
							'@yohira/authentication.abstractions',
							'@yohira/authentication.cookies',
							'@yohira/base',
							'@yohira/core',
							'@yohira/diagnostics',
							'@yohira/extensions.caching.memory',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.binder',
							'@yohira/extensions.config.env-variables',
							'@yohira/extensions.config.file-extensions',
							'@yohira/extensions.config.json',
							'@yohira/extensions.dependency-injection',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.dependency-injection.specification.tests',
							'@yohira/extensions.features',
							'@yohira/extensions.file-providers',
							'@yohira/extensions.hosting',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/extensions.logging',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/extensions.options.config-extensions',
							'@yohira/extensions.primitives',
							'@yohira/hosting',
							'@yohira/hosting.abstractions',
							'@yohira/hosting.server.abstractions',
							'@yohira/http',
							'@yohira/http-logging',
							'@yohira/http.abstractions',
							'@yohira/http.extensions',
							'@yohira/http.features',
							'@yohira/http.headers',
							'@yohira/http.shared',
							'@yohira/https-policy',
							'@yohira/mvc.abstractions',
							'@yohira/mvc.core',
							'@yohira/routing',
							'@yohira/server.node',
							'@yohira/server.node.core',
							'@yohira/session',
							'@yohira/static-files',
							'@yohira/third-party.inversify',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/authentication',
						allow: [
							'@yohira/authentication.abstractions',
							'@yohira/authentication.core',
							'@yohira/base',
							'@yohira/data-protection',
							'@yohira/data-protection.abstractions',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/extensions.web-encoders',
							'@yohira/http',
							'@yohira/http.abstractions',
							'@yohira/http.features',
							'@yohira/shared',
						],
					},
					{
						from: '@yohira/authentication.abstractions',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/http.abstractions',
						],
					},
					{
						from: '@yohira/authentication.cookies',
						allow: [
							'@yohira/authentication',
							'@yohira/authentication.abstractions',
							'@yohira/base',
							'@yohira/data-protection.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/extensions.primitives',
							'@yohira/http.abstractions',
							'@yohira/http.features',
							'@yohira/http.headers',
							'@yohira/http.shared',
						],
					},
					{
						from: '@yohira/authentication.core',
						allow: [
							'@yohira/authentication.abstractions',
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.options',
							'@yohira/http.abstractions',
						],
					},
					{
						from: '@yohira/base',
						allow: ['@yohira/third-party.ts-results'],
					},
					{
						from: '@yohira/core',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.env-variables',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.hosting',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/hosting',
							'@yohira/hosting.abstractions',
							'@yohira/http',
							'@yohira/http.abstractions',
							'@yohira/routing',
							'@yohira/server.node',
						],
					},
					{
						from: '@yohira/cryptography',
						allow: [
							'@yohira/base',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/data-protection',
						allow: [
							'@yohira/base',
							'@yohira/cryptography',
							'@yohira/data-protection.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/xml',
						],
					},
					{
						from: '@yohira/data-protection.abstractions',
						allow: ['@yohira/cryptography'],
					},
					{
						from: '@yohira/diagnostics',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/http.abstractions',
						],
					},
					{
						from: '@yohira/extensions.caching.abstractions',
						allow: ['@yohira/third-party.ts-results'],
					},
					{
						from: '@yohira/extensions.caching.memory',
						allow: [
							'@yohira/base',
							'@yohira/extensions.caching.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.config',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config.abstractions',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.config.abstractions',
						allow: [
							'@yohira/base',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.config.builder',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config.abstractions',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.config.env-variables',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
						],
					},
					{
						from: '@yohira/extensions.config.file-extensions',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.file-providers',
						],
					},
					{
						from: '@yohira/extensions.config.json',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.file-extensions',
							'@yohira/extensions.file-providers',
						],
					},
					{
						from: '@yohira/extensions.dependency-injection',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/third-party.inversify',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.dependency-injection.abstractions',
						allow: [
							'@yohira/base',
							'@yohira/third-party.inversify',
						],
					},
					{
						from: '@yohira/extensions.dependency-injection.specification.tests',
						allow: [],
					},
					{
						from: '@yohira/extensions.features',
						allow: [
							'@yohira/base',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/extensions.file-providers',
						allow: ['@yohira/base'],
					},
					{
						from: '@yohira/extensions.hosting',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.env-variables',
							'@yohira/extensions.config.file-extensions',
							'@yohira/extensions.config.json',
							'@yohira/extensions.dependency-injection',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/extensions.logging',
							'@yohira/extensions.logging.abstractions',
							'@yohira/hosting',
						],
					},
					{
						from: '@yohira/extensions.hosting.abstractions',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
						],
					},
					{
						from: '@yohira/extensions.logging',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
						],
					},
					{
						from: '@yohira/extensions.logging.abstractions',
						allow: [
							'@yohira/extensions.dependency-injection.abstractions',
						],
					},
					{
						from: '@yohira/extensions.options',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
						],
					},
					{
						from: '@yohira/extensions.options.config-extensions',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.binder',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.options',
						],
					},
					{
						from: '@yohira/extensions.primitives',
						allow: ['@yohira/base'],
					},
					{
						from: '@yohira/extensions.web-encoders',
						allow: [
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.options',
						],
					},
					{
						from: '@yohira/hosting',
						allow: [
							'@yohira/base',
							'@yohira/extensions.config',
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.config.env-variables',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.features',
							'@yohira/extensions.file-providers',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/hosting.abstractions',
							'@yohira/hosting.server.abstractions',
							'@yohira/http',
							'@yohira/http.abstractions',
						],
					},
					{
						from: '@yohira/hosting.abstractions',
						allow: [
							'@yohira/extensions.config.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.file-providers',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/http.abstractions',
						],
					},
					{
						from: '@yohira/hosting.server.abstractions',
						allow: ['@yohira/base', '@yohira/extensions.features'],
					},
					{
						from: '@yohira/http',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.features',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.primitives',
							'@yohira/http.abstractions',
							'@yohira/http.features',
							'@yohira/http.headers',
							'@yohira/http.shared',
						],
					},
					{
						from: '@yohira/http-logging',
						allow: [
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/http.abstractions',
							'@yohira/http.headers',
						],
					},
					{
						from: '@yohira/http.abstractions',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.features',
							'@yohira/extensions.primitives',
							'@yohira/http.features',
							'@yohira/http.shared',
						],
					},
					{
						from: '@yohira/http.extensions',
						allow: [
							'@yohira/extensions.features',
							'@yohira/extensions.file-providers',
							'@yohira/http.abstractions',
							'@yohira/http.features',
						],
					},
					{
						from: '@yohira/http.features',
						allow: [
							'@yohira/base',
							'@yohira/extensions.primitives',
							'@yohira/http.headers',
						],
					},
					{
						from: '@yohira/http.headers',
						allow: [
							'@yohira/base',
							'@yohira/extensions.primitives',
							'@yohira/http.shared',
							'@yohira/shared',
						],
					},
					{
						from: '@yohira/http.shared',
						allow: [
							'@yohira/base',
							'@yohira/extensions.primitives',
							'@yohira/shared',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/https-policy',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/http.abstractions',
							'@yohira/http.extensions',
							'@yohira/http.headers',
						],
					},
					{
						from: '@yohira/mvc.abstractions',
						allow: ['@yohira/http.abstractions'],
					},
					{
						from: '@yohira/mvc.core',
						allow: [
							'@yohira/authentication.abstractions',
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.file-providers',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.primitives',
							'@yohira/hosting.abstractions',
							'@yohira/http.abstractions',
							'@yohira/http.extensions',
							'@yohira/http.headers',
							'@yohira/mvc.abstractions',
						],
					},
					{
						from: '@yohira/routing',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/http',
							'@yohira/http.abstractions',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/server.node',
						allow: [
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.options',
							'@yohira/hosting.abstractions',
							'@yohira/hosting.server.abstractions',
							'@yohira/server.node.core',
						],
					},
					{
						from: '@yohira/server.node.core',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.features',
							'@yohira/extensions.logging.abstractions',
							'@yohira/hosting',
							'@yohira/hosting.server.abstractions',
							'@yohira/http.abstractions',
							'@yohira/http.features',
						],
					},
					{
						from: '@yohira/session',
						allow: [
							'@yohira/data-protection',
							'@yohira/data-protection.abstractions',
							'@yohira/extensions.caching.abstractions',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/http.abstractions',
							'@yohira/http.features',
							'@yohira/http.headers',
							'@yohira/http.shared',
						],
					},
					{
						from: '@yohira/shared',
						allow: [
							'@yohira/base',
							'@yohira/extensions.primitives',
						],
					},
					{
						from: '@yohira/static-files',
						allow: [
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.file-providers',
							'@yohira/extensions.logging.abstractions',
							'@yohira/extensions.options',
							'@yohira/hosting.abstractions',
							'@yohira/http.abstractions',
							'@yohira/http.extensions',
							'@yohira/third-party.ts-results',
						],
					},
					{
						from: '@yohira/test-host',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
							'@yohira/extensions.features',
							'@yohira/extensions.hosting.abstractions',
							'@yohira/extensions.options',
							'@yohira/hosting',
							'@yohira/hosting.abstractions',
							'@yohira/hosting.server.abstractions',
						],
					},
					{
						from: '@yohira/testing',
						allow: ['@yohira/extensions.logging.abstractions'],
					},
					{
						from: '@yohira/third-party.inversify',
						allow: [],
					},
					{
						from: '@yohira/third-party.mediatr',
						allow: [
							'@yohira/base',
							'@yohira/extensions.dependency-injection.abstractions',
						],
					},
					{
						from: '@yohira/third-party.ts-results',
						allow: [],
					},
					{
						from: '@yohira/xml',
						allow: ['@yohira/base'],
					},
				],
			},
		],
	},
};
