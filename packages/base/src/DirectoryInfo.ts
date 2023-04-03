import { mkdirSync } from 'node:fs';

import { FileSystemInfo } from './FileSystemInfo';
import { getFullPath } from './Path';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/DirectoryInfo.cs,30fa608717e5ce8e,references
export class DirectoryInfo extends FileSystemInfo {
	private isNormalized = false;

	private init(
		originalPath: string,
		fullPath?: string,
		fileName?: string,
		isNormalized = false,
	): void {
		this.originalPath = originalPath;

		fullPath ??= originalPath;
		fullPath = isNormalized ? fullPath : getFullPath(fullPath);

		this._name = fileName;

		this.fullPath = fullPath;

		this.isNormalized = isNormalized;
	}

	constructor(path: string) {
		super();
		this.init(path, getFullPath(path), undefined, true);
	}

	get name(): string {
		// TODO
		throw new Error('Method not implemented.');
	}

	existsSync(): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	createSync(): void {
		mkdirSync(this.fullPath, { recursive: true });
	}
}
