module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		// https://typescript-eslint.io/getting-started/typed-linting/monorepos/#one-tsconfigjson-per-package-and-an-optional-one-in-the-root
		project: ['./tsconfig.base.json', './packages/*/tsconfig.json'],
		sourceType: 'module',
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: ['plugin:@typescript-eslint/recommended'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.cjs'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-empty-function': 'off',
	},
};
