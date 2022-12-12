import { FileInfo } from '@/base/FileInfo';
import { IFileInfo } from '@/fileProviders/IFileInfo';

export class PhysicalFileInfo implements IFileInfo {
	constructor(private readonly info: FileInfo) {}

	get exists(): boolean {
		return this.info.exists;
	}

	get name(): string {
		return ''; /* TODO */
	}
}
