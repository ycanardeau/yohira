import { DirectoryInfo, Lazy, combinePaths } from '@yohira/base';
import { homedir } from 'node:os';

import { IDefaultKeyStorageDirectories } from './IDefaultKeyStorageDirectories';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Repositories/DefaultKeyStorageDirectories.cs,cb9d38d371440f10,references
export class DefaultKeyStorageDirectories
	implements IDefaultKeyStorageDirectories
{
	private static readonly dataProtectionKeysFolderName =
		'DataProtection-Keys';

	private static getKeyStorageDirectoryImpl(): DirectoryInfo | undefined {
		let retVal: DirectoryInfo | undefined = undefined;

		// TODO
		const homePath = homedir();

		if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else if (homePath !== undefined) {
			if (false /* TODO */) {
				// TODO
				throw new Error('Method not implemented.');
			} else {
				retVal = new DirectoryInfo(
					combinePaths(
						homePath,
						'.yohira',
						DefaultKeyStorageDirectories.dataProtectionKeysFolderName,
					),
				);
			}
		} else if (false /* TODO */) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			return undefined;
		}

		if (retVal === undefined) {
			throw new Error('Assertion failed.');
		}

		try {
			retVal.createSync(); // throws if we don't have access, e.g., user profile not loaded
			return retVal;
		} catch {
			return undefined;
		}
	}

	private static readonly defaultDirectoryLazy = new Lazy<
		DirectoryInfo | undefined
	>(DefaultKeyStorageDirectories.getKeyStorageDirectoryImpl);

	static readonly instance = new DefaultKeyStorageDirectories();

	getKeyStorageDirectory(): DirectoryInfo | undefined {
		return DefaultKeyStorageDirectories.defaultDirectoryLazy.value;
	}
}
