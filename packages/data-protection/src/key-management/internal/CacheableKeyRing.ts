import { IKey } from '../IKey';
import { KeyRing } from '../KeyRing';
import { IKeyRing } from './IKeyRing';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/CacheableKeyRing.cs,fd46b7a222155a07,references
export class CacheableKeyRing {
	private constructor(
		// TODO: expirationToken,
		readonly expirationTime: number,
		readonly keyRing: IKeyRing,
	) {}

	static create(
		expirationTime: number,
		defaultKey: IKey,
		allKeys: Iterable<IKey>,
	): CacheableKeyRing {
		return new CacheableKeyRing(
			expirationTime,
			new KeyRing(defaultKey, allKeys),
		);
	}

	static isValid(
		keyRing: CacheableKeyRing | undefined,
		utcNow: number,
	): boolean {
		return (
			keyRing !== undefined /* TODO */ && keyRing.expirationTime > utcNow
		);
	}
}
