import { Guid, Out, tryGetValue } from '@yohira/base';

import { IAuthenticatedEncryptor } from '../authenticated-encryption/IAuthenticatedEncryptor';
import { IKey } from './IKey';
import { IKeyRing } from './internal/IKeyRing';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRing.cs,416bb76dcc1a693c,references
// used for providing lazy activation of the authenticated encryptor instance
class KeyHolder {
	constructor(private readonly key: IKey) {}

	getEncryptorInstance(isRevoked: Out<boolean>): IAuthenticatedEncryptor {
		// TODO
		throw new Error('Method not implemented.');
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRing.cs,c8c7d12628d37770,references
export class KeyRing implements IKeyRing {
	private readonly defaultKeyHolder: KeyHolder;
	private readonly keyIdToKeyHolderMap: Map<
		string /* TODO: Guid */,
		KeyHolder
	>;

	readonly defaultKeyId: Guid;

	constructor(defaultKey: IKey, allKeys: Iterable<IKey>) {
		this.keyIdToKeyHolderMap = new Map();
		for (const key of allKeys) {
			this.keyIdToKeyHolderMap.set(
				key.keyId.toString(),
				new KeyHolder(key),
			);
		}

		// It's possible under some circumstances that the default key won't be part of 'allKeys',
		// such as if the key manager is forced to use the key it just generated even if such key
		// wasn't in the underlying repository. In this case, we just add it now.
		if (!this.keyIdToKeyHolderMap.has(defaultKey.keyId.toString())) {
			this.keyIdToKeyHolderMap.set(
				defaultKey.keyId.toString(),
				new KeyHolder(defaultKey),
			);
		}

		this.defaultKeyId = defaultKey.keyId;
		this.defaultKeyHolder = this.keyIdToKeyHolderMap.get(
			this.defaultKeyId.toString(),
		)!;
	}

	get defaultAuthenticatedEncryptor(): IAuthenticatedEncryptor | undefined {
		return this.defaultKeyHolder.getEncryptorInstance({ set: () => {} });
	}

	getAuthenticatedEncryptorByKeyId(
		keyId: Guid,
		isRevoked: Out<boolean>,
	): IAuthenticatedEncryptor | undefined {
		isRevoked.set(false);
		const tryGetValueResult = tryGetValue(
			this.keyIdToKeyHolderMap,
			keyId.toString(),
		);
		const holder = tryGetValueResult.val;
		return holder?.getEncryptorInstance(isRevoked);
	}
}
