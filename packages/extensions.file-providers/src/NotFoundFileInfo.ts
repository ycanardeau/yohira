import { IFileInfo } from './IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NotFoundFileInfo.cs,1e746a429f3aac04,references
export class NotFoundFileInfo implements IFileInfo {
	constructor(readonly name: string) {}

	existsSync(): boolean {
		return false;
	}

	get length(): number {
		return -1;
	}

	get physicalPath(): string | undefined {
		return undefined;
	}
}
