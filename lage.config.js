module.exports = {
	pipeline: {
		build: ['^build'],
		test: ['build'],
		lint: [],
		clean: [],
	},
	npmClient: 'npm',

	// All of these options are sent to `backfill`: https://github.com/microsoft/backfill/blob/master/README.md
	cacheOptions: {
		// These are the subset of files in the package directories that will be saved into the cache
		outputGlob: [
			'dist/**/*',
			'lib/**/*',
			'lib-commonjs/**/*',
			'lib-amd/**/*',
			'esm/**/*',
			'**/*.source.json',
			'**/*.info.json',
			'**/dist.stats.json',
			'**/*.tar.gz',
			'!bower_components',
			'!node_modules',
			'lib-es2015/**/*',
			'coverage/**/*',
			'src/**/*.scss.ts',
		],

		// These are relative to the git root, and affects the hash of the cache
		// Any of these file changes will invalidate cache
		environmentGlob: [
			'.devops/**/*',
			'*.js',
			'*.json',
			'*.yml',
			'apps/pr-deploy-site',
		],
	},
};
