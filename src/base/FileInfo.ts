import { FileSystemInfo } from '@/base/FileSystemInfo';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/FileInfo.cs,4ee673c1a4ecad41,references
export class FileInfo extends FileSystemInfo {
	constructor(fileName: string) {
		super();
	}

	get exists(): boolean {
		return false; /* TODO */
	}
}
