import { FileSystemInfo } from '@yohira/base';

import { ExclusionFilters } from './ExclusionFilters';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/FileSystemInfoHelper.cs,020c80373ae5f76c,references
export function isExcluded(
	fileSystemInfo: FileSystemInfo,
	filters: ExclusionFilters,
): boolean {
	if (filters === ExclusionFilters.None) {
		return false;
	} else if (
		fileSystemInfo.name.startsWith('.') &&
		(filters & ExclusionFilters.DotPrefixed) !== 0
	) {
		return true;
	} /* TODO: else if (
		fileSystemInfo.existsSync() &&
		(((fileSystemInfo.attributes & FileAttributes.Hidden) !== 0 &&
			(filters & ExclusionFilters.Hidden) !== 0) ||
			((fileSystemInfo.attributes & FileAttributes.System) !== 0 &&
				(filters & ExclusionFilters.System) !== 0))
	) {
		return true;
	}*/

	return false;
}
