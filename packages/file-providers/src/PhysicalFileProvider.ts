import { FileInfo } from '@yohira/base/FileInfo';
import { IDisposable } from '@yohira/base/IDisposable';
import { ExclusionFilters } from '@yohira/file-providers/ExclusionFilters';
import { isExcluded } from '@yohira/file-providers/FileSystemInfoHelper';
import { IFileInfo } from '@yohira/file-providers/IFileInfo';
import { IFileProvider } from '@yohira/file-providers/IFileProvider';
import { NotFoundFileInfo } from '@yohira/file-providers/NotFoundFileInfo';
import {
	ensureTrailingSlash,
	hasInvalidPathChars,
	pathNavigatesAboveRoot,
} from '@yohira/file-providers/PathUtils';
import { PhysicalFileInfo } from '@yohira/file-providers/PhysicalFileInfo';
import { isAbsolute, resolve } from 'node:path';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileProvider.cs,deeb5176dbadb21d,references
export class PhysicalFileProvider implements IFileProvider, IDisposable {
	readonly root: string;

	constructor(
		root: string,
		private readonly filters = ExclusionFilters.Sensitive,
	) {
		if (!isAbsolute(root)) {
			throw new Error('The path must be absolute.');
		}

		const fullRoot = resolve(root);
		this.root = ensureTrailingSlash(fullRoot);

		// TODO
	}

	dispose = async (): Promise<void> => {
		// TODO
	};

	private isUnderneathRoot = (fullPath: string): boolean => {
		return fullPath.toLowerCase().startsWith(this.root.toLowerCase());
	};

	private getFullPath = (path: string): string | undefined => {
		if (pathNavigatesAboveRoot(path)) {
			return undefined;
		}

		const fullPath = resolve(this.root, path); /* TODO */

		if (!this.isUnderneathRoot(fullPath)) {
			return undefined;
		}

		return fullPath;
	};

	getFileInfo = (subpath: string): IFileInfo => {
		if (!subpath || hasInvalidPathChars(subpath)) {
			return new NotFoundFileInfo(subpath);
		}

		// Relative paths starting with leading slashes are okay
		subpath = subpath.replace(
			/^[\\/]+/ /* TODO: pathSeparators */,
			'',
		) /* TODO */;

		// Absolute paths not permitted.
		if (isAbsolute(subpath)) {
			return new NotFoundFileInfo(subpath);
		}

		const fullPath = this.getFullPath(subpath);
		if (fullPath === undefined) {
			return new NotFoundFileInfo(subpath);
		}

		const fileInfo = new FileInfo(fullPath);
		if (isExcluded(fileInfo, this.filters)) {
			return new NotFoundFileInfo(subpath);
		}

		return new PhysicalFileInfo(fileInfo);
	};
}