import { IDisposable } from '@/base/IDisposable';
import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';
import { NotFoundFileInfo } from '@/fileProviders/NotFoundFileInfo';
import { hasInvalidPathChars } from '@/fileProviders/PathUtils';
import { PhysicalFileInfo } from '@/fileProviders/PhysicalFileInfo';
import { isAbsolute } from 'node:path';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileProvider.cs,deeb5176dbadb21d,references
export class PhysicalFileProvider implements IFileProvider, IDisposable {
	constructor(root: string) {}

	dispose = async (): Promise<void> => {
		// TODO
	};

	private getFullPath = (path: string): string | undefined => {
		return undefined; /* TODO */
	};

	getFileInfo = (subpath: string): IFileInfo => {
		if (!subpath || hasInvalidPathChars(subpath)) {
			return new NotFoundFileInfo(subpath);
		}

		// Relative paths starting with leading slashes are okay
		subpath = subpath.replace(/^[\\/]+/, '') /* TODO */;

		// Absolute paths not permitted.
		if (isAbsolute(subpath)) {
			return new NotFoundFileInfo(subpath);
		}

		const fullPath = this.getFullPath(subpath);
		if (fullPath === undefined) {
			return new NotFoundFileInfo(subpath);
		}

		// TODO: const fileInfo = new FileInfo(fullPath);
		if (true /* TODO: isExcluded(fileInfo, this.filters) */) {
			return new NotFoundFileInfo(subpath);
		}

		return new PhysicalFileInfo(/* TODO */);
	};
}
