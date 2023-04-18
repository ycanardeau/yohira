import { Out } from '@yohira/base';

import { KeySizes } from './KeySizes';

// https://source.dot.net/#System.Security.Cryptography/src/libraries/Common/src/System/Security/Cryptography/KeySizeHelpers.cs,c76f55a5c074c2d4,references
export function cloneKeySizesArray(src: KeySizes[]): KeySizes[] {
	return src.map((value) => value.clone());
}

// https://source.dot.net/#System.Security.Cryptography/src/libraries/Common/src/System/Security/Cryptography/KeySizeHelpers.cs,6e55ab63d5782639,references
function isLegalSizeCore(
	size: number,
	legalSizes: KeySizes,
	validatedByZeroSkipSizeKeySizes: Out<boolean>,
): boolean {
	validatedByZeroSkipSizeKeySizes.set(false);

	// If a cipher has only one valid key size, MinSize == MaxSize and SkipSize will be 0
	if (legalSizes.skipSize === 0) {
		if (legalSizes.minSize === size) {
			// Signal that we were validated by a 0-skipsize KeySizes entry. Needed to preserve a very obscure
			// piece of back-compat behavior.
			validatedByZeroSkipSizeKeySizes.set(true);
			return true;
		}
	} else if (size >= legalSizes.minSize && size <= legalSizes.maxSize) {
		// If the number is in range, check to see if it's a legal increment above MinSize
		const delta = size - legalSizes.minSize;

		// While it would be unusual to see KeySizes { 10, 20, 5 } and { 11, 14, 1 }, it could happen.
		// So don't return false just because this one doesn't match.
		if (delta % legalSizes.skipSize === 0) {
			return true;
		}
	}

	return false;
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
