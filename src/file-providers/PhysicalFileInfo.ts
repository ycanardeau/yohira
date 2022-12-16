import { FileInfo } from '@/base/FileInfo';
import { IFileInfo } from '@/file-providers/IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileInfo.cs,0e5c144b50161ab9,references
export class PhysicalFileInfo implements IFileInfo {
	constructor(private readonly info: FileInfo) {}

	get exists(): boolean {
		return this.info.exists;
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
}
