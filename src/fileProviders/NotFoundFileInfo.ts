import { IFileInfo } from '@/fileProviders/IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NotFoundFileInfo.cs,1e746a429f3aac04,references
export class NotFoundFileInfo implements IFileInfo {
	constructor(readonly name: string) {}

	get exists(): boolean {
		return false;
	}
}
