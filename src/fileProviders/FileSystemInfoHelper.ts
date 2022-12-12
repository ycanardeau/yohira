import { FileSystemInfo } from '@/base/FileSystemInfo';
import { ExclusionFilters } from '@/fileProviders/ExclusionFilters';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/Internal/FileSystemInfoHelper.cs,020c80373ae5f76c,references
export const isExcluded = (
	fileSystemInfo: FileSystemInfo,
	filters: ExclusionFilters,
): boolean => {
	if (filters === ExclusionFilters.None) {
		return false;
	}

	return true; /* TODO */
};
