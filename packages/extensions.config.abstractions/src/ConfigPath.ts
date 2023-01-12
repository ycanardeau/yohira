import { lastIndexOfIgnoreCase } from '@yohira/base/StringExtensions';

export const keyDelimiter = ':';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationPath.cs,e615ae2c8cbb7b82,references
export function combineConfigPath(...pathSegments: string[]): string {
	return pathSegments.join(keyDelimiter);
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationPath.cs,a0b601ef89ad6676,references
export function getSectionKey(path: string | undefined): string | undefined {
	if (!path) {
		return path;
	}

	const lastDelimiterIndex = lastIndexOfIgnoreCase(path, keyDelimiter);
	return lastDelimiterIndex === -1
		? path
		: path.substring(lastDelimiterIndex + 1);
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationPath.cs,5bea91f84a3cfeeb
export function getParentPath(path: string | undefined): string | undefined {
	if (!path) {
		return undefined;
	}

	const lastDelimiterIndex = lastIndexOfIgnoreCase(path, keyDelimiter);
	return lastDelimiterIndex === -1
		? undefined
		: path.substring(0, lastDelimiterIndex);
}
