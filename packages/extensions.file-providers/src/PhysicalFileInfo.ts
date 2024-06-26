import { FileInfo } from '@yohira/base';

import { IFileInfo } from './IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileInfo.cs,0e5c144b50161ab9,references
export class PhysicalFileInfo implements IFileInfo {
	constructor(private readonly info: FileInfo) {}

	existsSync(): boolean {
		return this.info.existsSync();
	}

	get length(): number {
		return this.info.length;
	}

	get physicalPath(): string {
		return this.info.fullName;
	}

	get name(): string {
		return this.info.name;
	}

	get lastModified(): Date /* TODO: DateTimeOffset */ {
		return this.info.lastWriteTimeUtc;
	}
}
