import { DirectoryInfo } from '@yohira/base';

export const IDefaultKeyStorageDirectories = Symbol.for(
	'IDefaultKeyStorageDirectories',
);
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Repositories/IDefaultKeyStorageDirectory.cs,5a6a130dda0ea9b9,references
/**
 * This interface enables overridding the default storage location of keys on disk
 */
export interface IDefaultKeyStorageDirectories {
	getKeyStorageDirectory(): DirectoryInfo | undefined;
}
