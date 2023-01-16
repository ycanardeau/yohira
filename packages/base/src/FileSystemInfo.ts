import { FileAttributes } from '@/FileAttributes';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/FileSystemInfo.cs,32b1bf3d4eb90f32,references
export abstract class FileSystemInfo {
	protected fullPath!: string;
	protected originalPath!: string;

	_name?: string;

	get fullName(): string {
		return this.fullPath;
	}

	abstract get name(): string;

	abstract get exists(): boolean;

	get attributes(): FileAttributes {
		throw new Error('Method not implemented.');
	}
}
