// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/FileSystemInfo.cs,32b1bf3d4eb90f32,references
export abstract class FileSystemInfo {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	protected fullPath: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	protected originalPath: string = undefined!;

	_name?: string;

	get fullName(): string {
		return this.fullPath;
	}

	abstract get exists(): boolean;
}
