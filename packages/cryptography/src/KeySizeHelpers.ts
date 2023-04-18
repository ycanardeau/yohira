import { Out } from '@yohira/base';

import { KeySizes } from './KeySizes';

// https://source.dot.net/#System.Security.Cryptography/src/libraries/Common/src/System/Security/Cryptography/KeySizeHelpers.cs,6e55ab63d5782639,references
function isLegalSizeCore(
	size: number,
	legalSizes: KeySizes,
	validatedByZeroSkipSizeKeySizes: Out<boolean>,
): boolean {
	// TODO
	throw new Error('Method not implemented.');
}

// https://source.dot.net/#System.Security.Cryptography/src/libraries/Common/src/System/Security/Cryptography/KeySizeHelpers.cs,5f2dcc2a36f96606,references
export function isLegalSize(
	size: number,
	legalSizes: KeySizes[],
	validatedByZeroSkipSizeKeySizes: Out<boolean>,
): boolean {
	for (let i = 0; i < legalSizes.length; i++) {
		if (
			isLegalSizeCore(
				size,
				legalSizes[i],
				validatedByZeroSkipSizeKeySizes,
			)
		) {
			return true;
		}
	}

	validatedByZeroSkipSizeKeySizes.set(false);
	return false;
}
