import { FileSystemInfo } from '@/FileSystemInfo';
import { getFileName, getFullPath } from '@/Path';
import { existsSync } from 'node:fs';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/FileInfo.cs,4ee673c1a4ecad41,references
export class FileInfo extends FileSystemInfo {
	constructor(
		originalPath: string,
		fullPath: string | undefined = undefined,
		fileName: string | undefined = undefined,
		isNormalized = false,
	) {
		super();

		this.originalPath = originalPath;

		fullPath ??= originalPath;
		// TODO

		this.fullPath = isNormalized
			? fullPath ?? originalPath
			: getFullPath(fullPath);
		this._name = fileName;
	}

	get name(): string {
		return (this._name ??= getFileName(this.originalPath));
	}

	get length(): number {
		return 0; /* TODO */
	}

	get exists(): boolean {
		// REVIEW: Should we replace `existsSync` with `access`?
		return existsSync(this.fullPath);
	}
}
