import { sep } from 'node:path';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,01973375afd0c585,references
const invalidFileNameCharsRegExp = new RegExp(
	/["<>|\u0000-\u001F:*?]/ /* TODO: Vary by file system. */,
);

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,25bea12c519603bd,references
export const hasInvalidPathChars = (path: string): boolean => {
	return invalidFileNameCharsRegExp.test(path);
};

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,9461c81a68263e40,references
export const ensureTrailingSlash = (path: string): string => {
	if (path && path[path.length - 1] !== sep) {
		return `${path}${sep}`;
	}

	return path;
};

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/PathUtils.cs,80f5c7da653cf058,references
export const pathNavigatesAboveRoot = (path: string): boolean => {
	let depth = 0;

	const segments = path.split(/[\\/]/ /* TODO: pathSeparators */);
	for (const segment of segments) {
		if (segment === '.' || segment === '') {
			continue;
		} else if (segment === '..') {
			depth--;

			if (depth == -1) {
				return true;
			}
		} else {
			depth++;
		}
	}

	return false;
};
