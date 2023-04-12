import { IList, List } from '@yohira/base';

import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { IXmlRepository } from '../repositories/IXmlRepository';
import { IXmlEncryptor } from '../xml-encryption/IXmlEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyManagementOptions.cs,06667162718921af,references
export class KeyManagementOptions {
	private static readonly _keyPropagationWindow = 2 * 24 * 60 * 60 * 1000;
	private static readonly _maxServerClockSkew = 5 * 60 * 1000;
	private _newKeyLifetime = 90 * 24 * 60 * 60 * 1000;

	xmlRepository?: IXmlRepository;
	xmlEncryptor?: IXmlEncryptor;

	readonly authenticatedEncryptorFactories: IList<IAuthenticatedEncryptorFactory> =
		new List();

	constructor(other?: KeyManagementOptions) {
		if (other !== undefined) {
			// TODO

			for (const encryptorFactory of other.authenticatedEncryptorFactories) {
				this.authenticatedEncryptorFactories.add(encryptorFactory);
			}
		}
	}

	autoGenerateKeys = true;

	/** @internal */ static get keyPropagationWindow(): number {
		// This value is not settable since there's a complex interaction between
		// it and the key ring refresh period.
		return KeyManagementOptions._keyPropagationWindow;
	}

	/** @internal */ static get maxServerClockSkew(): number {
		return KeyManagementOptions._maxServerClockSkew;
	}

	get newKeyLifetime(): number {
		return this._newKeyLifetime;
	}
	set newKeyLifetime(value: number) {
		if (value < 7 * 24 * 60 * 60 * 1000) {
			throw new Error(
				'The new key lifetime must be at least one week.' /* LOC */,
			);
		}
		this._newKeyLifetime = value;
	}
}
