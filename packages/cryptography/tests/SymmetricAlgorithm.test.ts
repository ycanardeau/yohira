import {
	ICryptoTransform,
	PaddingMode,
	SymmetricAlgorithm,
} from '@yohira/cryptography';
import { expect, test } from 'vitest';

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L813
function* CiphertextLengthTheories(): Generator<
	[PaddingMode, number, number, number]
> {
	const fullPaddings = [
		PaddingMode.ANSIX923,
		PaddingMode.ISO10126,
		PaddingMode.PKCS7,
	];

	for (const mode of fullPaddings) {
		// 128-bit aligned value
		yield [mode, 0, 16, 128];
		yield [mode, 15, 16, 128];
		yield [mode, 16, 32, 128];
		yield [mode, 17, 32, 128];
		yield [mode, 1023, 1024, 128];
		yield [mode, 0x7fffffef, 0x7ffffff0, 128];

		// 64-bit aligned value
		yield [mode, 0, 8, 64];
		yield [mode, 15, 16, 64];
		yield [mode, 16, 24, 64];
		yield [mode, 17, 24, 64];
		yield [mode, 1023, 1024, 64];
		yield [mode, 0x7ffffff7, 0x7ffffff8, 64];

		// 8-bit aligned value
		yield [mode, 0, 1, 8];
		yield [mode, 7, 8, 8];
		yield [mode, 16, 17, 8];
		yield [mode, 17, 18, 8];
		yield [mode, 1023, 1024, 8];
		yield [mode, 0x7ffffffe, 0x7fffffff, 8];

		// 176-bit (22 byte) aligned value
		yield [mode, 0, 22, 176];
		yield [mode, 21, 22, 176];
		yield [mode, 22, 44, 176];
		yield [mode, 43, 44, 176];
		yield [mode, 1011, 1012, 176];
		yield [mode, 0x7ffffffd, 0x7ffffffe, 176];
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L884
function* AllPaddingModes(): Generator<[PaddingMode]> {
	yield [PaddingMode.ANSIX923];
	yield [PaddingMode.ISO10126];
	yield [PaddingMode.PKCS7];
	yield [PaddingMode.Zeros];
	yield [PaddingMode.None];
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L896
class AnySizeAlgorithm extends SymmetricAlgorithm {
	constructor() {
		super();
	}

	get blockSize(): number {
		return this.blockSizeValue;
	}
	set blockSize(value: number) {
		this.blockSizeValue = value;
	}

	createDecryptorCore(): ICryptoTransform {
		throw new Error('Method not implemented.');
	}
	createEncryptorCore(): ICryptoTransform {
		throw new Error('Method not implemented.');
	}
	generateIV(): void {
		throw new Error('Method not implemented.');
	}
	generateKey(): void {
		throw new Error('Method not implemented.');
	}
}

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L13
test('GetCiphertextLengthBlock_ValidInputs', () => {
	function GetCiphertextLengthBlock_ValidInputs(
		mode: PaddingMode,
		plaintextSize: number,
		expectedCiphertextSize: number,
		alignmentSizeInBits: number,
	): void {
		const alg = new AnySizeAlgorithm();
		alg.blockSize = alignmentSizeInBits;
		const ciphertextSizeCbc = alg.getCiphertextLengthCbc(
			plaintextSize,
			mode,
		);
		const ciphertextSizeEcb = alg.getCiphertextLengthEcb(
			plaintextSize,
			mode,
		);
		expect(ciphertextSizeCbc).toBe(expectedCiphertextSize);
		expect(ciphertextSizeEcb).toBe(expectedCiphertextSize);
	}

	for (const [
		mode,
		plaintextSize,
		expectedCiphertextSize,
		alignmentSizeInBits,
	] of CiphertextLengthTheories()) {
		GetCiphertextLengthBlock_ValidInputs(
			mode,
			plaintextSize,
			expectedCiphertextSize,
			alignmentSizeInBits,
		);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L28
test('GetCiphertextLengthCfb_ValidInputs', () => {
	function GetCiphertextLengthCfb_ValidInputs(
		mode: PaddingMode,
		plaintextSize: number,
		expectedCiphertextSize: number,
		alignmentSizeInBits: number,
	): void {
		const alg = new AnySizeAlgorithm();
		const ciphertextSizeCfb = alg.getCiphertextLengthCfb(
			plaintextSize,
			mode,
			alignmentSizeInBits,
		);
		expect(ciphertextSizeCfb).toBe(expectedCiphertextSize);
	}

	for (const [
		mode,
		plaintextSize,
		expectedCiphertextSize,
		alignmentSizeInBits,
	] of CiphertextLengthTheories()) {
		GetCiphertextLengthCfb_ValidInputs(
			mode,
			plaintextSize,
			expectedCiphertextSize,
			alignmentSizeInBits,
		);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L41
test('GetCiphertextLength_ThrowsForNegativeInput', () => {
	function GetCiphertextLength_ThrowsForNegativeInput(
		mode: PaddingMode,
	): void {
		const alg = new AnySizeAlgorithm();
		alg.blockSize = 128;
		expect(() => alg.getCiphertextLengthCbc(-1, mode)).toThrowError(
			"plaintextLength ('-1') must be a non-negative value.",
		);
		expect(() => alg.getCiphertextLengthEcb(-1, mode)).toThrowError(
			"plaintextLength ('-1') must be a non-negative value.",
		);
		expect(() => alg.getCiphertextLengthCfb(-1, mode)).toThrowError(
			"plaintextLength ('-1') must be a non-negative value.",
		);
	}

	for (const [mode] of AllPaddingModes()) {
		GetCiphertextLength_ThrowsForNegativeInput(mode);
	}
});

// TODO

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L75
test('GetCiphertextLengthBlock_ThrowsForNonByteBlockSize', () => {
	function GetCiphertextLengthBlock_ThrowsForNonByteBlockSize(
		mode: PaddingMode,
	): void {
		const alg = new AnySizeAlgorithm();
		alg.blockSize = 5;
		expect(() => alg.getCiphertextLengthCbc(16, mode)).toThrowError(
			"The algorithm's block size is not supported.",
		);
		expect(() => alg.getCiphertextLengthEcb(16, mode)).toThrowError(
			"The algorithm's block size is not supported.",
		);
	}

	for (const [mode] of AllPaddingModes()) {
		GetCiphertextLengthBlock_ThrowsForNonByteBlockSize(mode);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L84
test('GetCiphertextLengthCfb_ThrowsForNonByteFeedbackSize', () => {
	function GetCiphertextLengthCfb_ThrowsForNonByteFeedbackSize(
		mode: PaddingMode,
	): void {
		const alg = new AnySizeAlgorithm();
		expect(() => alg.getCiphertextLengthCfb(16, mode, 7)).toThrowError(
			'The value specified in bits must be a whole number of bytes.',
		);
	}

	for (const [mode] of AllPaddingModes()) {
		GetCiphertextLengthCfb_ThrowsForNonByteFeedbackSize(mode);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L93
test('GetCiphertextLengthBlock_ThrowsForZeroBlockSize', () => {
	function GetCiphertextLengthBlock_ThrowsForZeroBlockSize(
		mode: PaddingMode,
	): void {
		const alg = new AnySizeAlgorithm();
		alg.blockSize = 0;
		expect(() => alg.getCiphertextLengthCbc(16, mode)).toThrowError(
			"The algorithm's block size is not supported.",
		);
		expect(() => alg.getCiphertextLengthEcb(16, mode)).toThrowError(
			"The algorithm's block size is not supported.",
		);
	}

	for (const [mode] of AllPaddingModes()) {
		GetCiphertextLengthBlock_ThrowsForZeroBlockSize(mode);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L102
test('GetCiphertextLengthCfb_ThrowsForZeroFeedbackSize', () => {
	function GetCiphertextLengthCfb_ThrowsForZeroFeedbackSize(
		mode: PaddingMode,
	): void {
		const alg = new AnySizeAlgorithm();
		expect(() => alg.getCiphertextLengthCfb(16, mode, 0)).toThrowError(
			"feedbackSizeInBits ('0') must be a non-negative and non-zero value.",
		);
	}

	for (const [mode] of AllPaddingModes()) {
		GetCiphertextLengthCfb_ThrowsForZeroFeedbackSize(mode);
	}
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L110
test('GetCiphertextLength_ThrowsForInvalidPaddingMode', () => {
	const alg = new AnySizeAlgorithm();
	alg.blockSize = 128;
	const mode = -1 as PaddingMode;
	expect(() => alg.getCiphertextLengthCbc(16, mode)).toThrowError(
		'Specified padding mode is not valid for this algorithm.',
	);
	expect(() => alg.getCiphertextLengthEcb(16, mode)).toThrowError(
		'Specified padding mode is not valid for this algorithm.',
	);
	expect(() => alg.getCiphertextLengthCfb(16, mode)).toThrowError(
		'Specified padding mode is not valid for this algorithm.',
	);
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L120
test('GetCiphertextLengthBlock_NoPaddingAndPlaintextSizeNotBlockAligned', () => {
	const alg = new AnySizeAlgorithm();
	alg.blockSize = 128;
	expect(() => alg.getCiphertextLengthCbc(17, PaddingMode.None)).toThrowError(
		'The specified plaintext size is not valid for the padding and block size.',
	);
	expect(() => alg.getCiphertextLengthEcb(17, PaddingMode.None)).toThrowError(
		'The specified plaintext size is not valid for the padding and block size.',
	);
});

// https://github.com/dotnet/runtime/blob/8cb3bf89e4b28b66bf3b4e2957fd015bf925a787/src/libraries/System.Security.Cryptography/tests/SymmetricAlgorithmTests.cs#L128
test('GetCiphertextLengthCfb_NoPaddingAndPlaintextSizeNotFeedbackAligned', () => {
	const alg = new AnySizeAlgorithm();
	expect(() =>
		alg.getCiphertextLengthCfb(17, PaddingMode.None, 128),
	).toThrowError(
		'The specified plaintext size is not valid for the padding and feedback size.',
	);
});

// TODO
