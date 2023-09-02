import { fail } from './CryptoUtil';
import { IDataProtectionProvider } from './IDataProtectionProvider';
import { IDataProtector } from './IDataProtector';

function isIDataProtector(
	value: IDataProtectionProvider,
): value is IDataProtector {
	return (
		'createProtector' in value && 'protect' in value && 'unprotect' in value
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection.Abstractions/DataProtectionCommonExtensions.cs,b113c36da66ca09a,references
export function createProtectorWithPurposes(
	provider: IDataProtectionProvider,
	purposes: Iterable<string>,
): IDataProtector {
	let collectionIsEmpty = true;
	let retVal = provider;
	for (const purpose of purposes) {
		if (purpose === undefined) {
			throw new Error(
				'The purposes collection cannot be null or empty and cannot contain null elements.' /* LOC */,
			);
		}
		retVal =
			retVal.createProtector(purpose) ??
			fail<IDataProtector>('CreateProtector returned undefined.');
		collectionIsEmpty = false;
	}

	if (collectionIsEmpty) {
		throw new Error(
			'The purposes collection cannot be null or empty and cannot contain null elements.' /* LOC */,
		);
	}

	// CreateProtector is supposed to return an instance of this interface
	if (!isIDataProtector(retVal)) {
		throw new Error('Assertion failed.');
	}
	return retVal;
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection.Abstractions/DataProtectionCommonExtensions.cs,7ce72a21408d9319,references
export function createProtectorWithPurposeAndSubPurposes(
	provider: IDataProtectionProvider,
	purpose: string,
	...subPurposes: string[]
): IDataProtector {
	let protector = provider.createProtector(purpose);
	if (subPurposes !== undefined && subPurposes.length > 0) {
		protector = createProtectorWithPurposes(protector, subPurposes);
	}
	return (
		protector ?? fail<IDataProtector>('CreateProtector returned undefined.')
	);
}
