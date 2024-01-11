import { directorySeparatorChar, getFullPath } from '@yohira/base';

// https://github.com/dotnet/aspire/blob/e3fc7cc96166078b27ba9e63558761ef265a2fcd/src/Aspire.Hosting/Utils/PathNormalizer.cs#L8
export function normalizePathForCurrentPlatform(path: string): string {
	if (!path) {
		return path;
	}

	path = path
		.replaceAll('\\', directorySeparatorChar)
		.replaceAll('/', directorySeparatorChar);

	return getFullPath(path);
}
