import { Stats, existsSync, statSync } from 'node:fs';

import { FileSystemInfo } from './FileSystemInfo';
import { getFileName, getFullPath } from './Path';

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

	private _fileStatus: Stats | undefined;
	private get fileStatus(): Stats {
		if (this._fileStatus === undefined) {
			this._fileStatus = statSync(this.fullPath);
		}

		return this._fileStatus;
	}

	get name(): string {
		return (this._name ??= getFileName(this.originalPath));
	}

	get length(): number {
		return this.fileStatus.size;
	}

	existsSync(): boolean {
		return existsSync(this.fullPath);
	}

	get lastWriteTimeUtc(): Date /* TODO: DateTimeOffset */ {
		return this.fileStatus.mtime;
	}
}
