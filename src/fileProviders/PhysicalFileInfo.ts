import { IFileInfo } from '@/fileProviders/IFileInfo';

export class PhysicalFileInfo implements IFileInfo {
	get exists(): boolean {
		return false; /* TODO */
	}

	get name(): string {
		return ''; /* TODO */
	}
}
