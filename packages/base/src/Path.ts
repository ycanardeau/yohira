import { tmpdir } from 'node:os';
import { posix } from 'node:path';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.cs,d1bb57592858d485,references
export const directorySeparatorChar = posix.sep;

export function combinePaths(...paths: string[]): string {
	return posix.resolve(...paths);
}

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.cs,95facc58d06cadd0,references
export function getFileName(path: string): string {
	return posix.basename(path);
}

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.Unix.cs,1274738792cce835,references
export function getFullPath(path: string): string {
	return posix.resolve(path);
}

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.cs,3314e07c84b689f1,references
export function getRelativePath(relativeTo: string, path: string): string {
	return posix.relative(relativeTo, path);
}

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.Unix.cs,3a7a8c72321c6e1d,references
export function getTempPath(): string {
	return posix.resolve(tmpdir());
}

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/IO/Path.Unix.cs,807960f08fca497d,references
export function isPathRooted(path: string): boolean {
	return posix.isAbsolute(path);
}
