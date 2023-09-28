import { IList, List, TimeSpan } from '@yohira/base';

import { IAuthenticatedEncryptorFactory } from '../authenticated-encryption/IAuthenticatedEncryptorFactory';
import { AlgorithmConfig } from '../authenticated-encryption/conifg-model/AlgorithmConfig';
import { IXmlRepository } from '../repositories/IXmlRepository';
import { IXmlEncryptor } from '../xml-encryption/IXmlEncryptor';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyManagementOptions.cs,06667162718921af,references
export class KeyManagementOptions {
	private static readonly _keyPropagationWindow = TimeSpan.fromDays(2);
	private static readonly _keyRingRefreshPeriod = TimeSpan.fromHours(24);
	private static readonly _maxServerClockSkew = TimeSpan.fromMinutes(5);
	private _newKeyLifetime = TimeSpan.fromDays(90);

	authenticatedEncryptorConfig: AlgorithmConfig | undefined;
	xmlRepository: IXmlRepository | undefined;
	xmlEncryptor: IXmlEncryptor | undefined;

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

	/** @internal */ static get keyPropagationWindow(): TimeSpan {
		// This value is not settable since there's a complex interaction between
		// it and the key ring refresh period.
		return KeyManagementOptions._keyPropagationWindow;
	}

	/** @internal */ static get keyRingRefreshPeriod(): TimeSpan {
		// This value is not settable since there's a complex interaction between
		// it and the key expiration safety period.
		return KeyManagementOptions._keyRingRefreshPeriod;
	}

	/** @internal */ static get maxServerClockSkew(): TimeSpan {
		return KeyManagementOptions._maxServerClockSkew;
	}

	get newKeyLifetime(): TimeSpan {
		return this._newKeyLifetime;
	}
	set newKeyLifetime(value: TimeSpan) {
		if (value.ticks < TimeSpan.fromDays(7).ticks) {
			throw new Error(
				'The new key lifetime must be at least one week.' /* LOC */,
			);
		}
		this._newKeyLifetime = value;
	}
}
