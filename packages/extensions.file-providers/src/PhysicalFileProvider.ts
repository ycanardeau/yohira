import { ExclusionFilters } from '@/ExclusionFilters';
import { isExcluded } from '@/FileSystemInfoHelper';
import { IFileInfo } from '@/IFileInfo';
import { IFileProvider } from '@/IFileProvider';
import { NotFoundFileInfo } from '@/NotFoundFileInfo';
import {
	ensureTrailingSlash,
	hasInvalidPathChars,
	pathNavigatesAboveRoot,
} from '@/PathUtils';
import { PhysicalFileInfo } from '@/PhysicalFileInfo';
import {
	FileInfo,
	IDisposable,
	combinePaths,
	getFullPath,
	getRelativePath,
	isPathRooted,
} from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileProvider.cs,deeb5176dbadb21d,references
export class PhysicalFileProvider implements IFileProvider, IDisposable {
	readonly root: string;

	constructor(
		root: string,
		private readonly filters = ExclusionFilters.Sensitive,
	) {
		if (!isPathRooted(root)) {
			throw new Error('The path must be absolute.');
		}

		const fullRoot = getFullPath(root);
		this.root = ensureTrailingSlash(fullRoot);

		// TODO
	}

	dispose(): void {
		// TODO
		//throw new Error('Method not implemented.');
	}

	private isUnderneathRoot(fullPath: string): boolean {
		return !getRelativePath(this.root, fullPath).startsWith(
			'..',
		) /* REVIEW */;
	}

	private getFullPath(path: string): string | undefined {
		if (pathNavigatesAboveRoot(path)) {
			return undefined;
		}

		const fullPath = getFullPath(combinePaths(this.root, path));

		if (!this.isUnderneathRoot(fullPath)) {
			return undefined;
		}

		return fullPath;
	}

	getFileInfo(subpath: string): IFileInfo {
		if (!subpath || hasInvalidPathChars(subpath)) {
			return new NotFoundFileInfo(subpath);
		}

		// Relative paths starting with leading slashes are okay
		subpath = subpath.replace(
			/^[\\/]+/ /* TODO: pathSeparators */,
			'',
		) /* TODO */;

		// Absolute paths not permitted.
		if (isPathRooted(subpath)) {
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
	}
}
