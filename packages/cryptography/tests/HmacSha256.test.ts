import { HMAC, HMACSHA256, HashAlgorithm, SHA256 } from '@yohira/cryptography';
import { Result } from '@yohira/third-party.ts-results';
import { test } from 'vitest';

import { testHmac } from './HmacTests';
import { Rfc4231HmacTests } from './Rfc4231HmacTests';

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L12
class HmacSha256Tests extends Rfc4231HmacTests {
	private static readonly s_testMacs4231: Buffer[] = [
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		undefined!,
		Buffer.from(
			'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7',
			'hex',
		),
		Buffer.from(
			'5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
			'hex',
		),
		Buffer.from(
			'773ea91e36800e46854db8ebd09181a72959098b3ef8c122d9635514ced565fe',
			'hex',
		),
		Buffer.from(
			'82558a389a443c0ea4cc819899f2083a85f0faa3e578f8077a2e3ff46729665b',
			'hex',
		),
		// RFC 4231 only defines the first 128 bits of this value.
		Buffer.from('a3b6167473100ee06e0c796c2955552b', 'hex'),
		Buffer.from(
			'60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54',
			'hex',
		),
		Buffer.from(
			'9b09ffa71b942fcb27635fbcd5b0e944bfdc63644f0713938a7f51535c3a35e2',
			'hex',
		),
	];

	constructor() {
		super(HmacSha256Tests.s_testMacs4231);
	}

	protected get blockSize(): number {
		return 64;
	}

	protected get macSize(): number {
		return HMACSHA256.hashSizeInBytes;
	}

	protected create(): HMAC {
		return new HMACSHA256();
	}

	protected createHashAlgorithm(): HashAlgorithm {
		return SHA256.create();
	}

	protected hashDataOneShot(key: Buffer, source: Buffer): Buffer;
	protected hashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): number;
	protected hashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination?: Buffer,
	): number | Buffer {
		if (destination !== undefined) {
			return HMACSHA256.hashData(key, source, destination);
		} else {
			return HMACSHA256.hashData(key, source);
		}
	}

	protected tryHashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): Result<number, number> {
		return HMACSHA256.tryHashData(key, source, destination);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L74
	HmacSha256_Rfc4231_1(): void {
		this.verifyHmac(1, HmacSha256Tests.s_testMacs4231[1]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L80
	HmacSha256_Rfc4231_2(): void {
		this.verifyHmac(2, HmacSha256Tests.s_testMacs4231[2]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L86
	HmacSha256_Rfc4231_3(): void {
		this.verifyHmac(3, HmacSha256Tests.s_testMacs4231[3]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L92
	HmacSha256_Rfc4231_4(): void {
		this.verifyHmac(4, HmacSha256Tests.s_testMacs4231[4]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L98
	HmacSha256_Rfc4231_5(): void {
		this.verifyHmac(5, HmacSha256Tests.s_testMacs4231[5]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L104
	HmacSha256_Rfc4231_6(): void {
		this.verifyHmac(6, HmacSha256Tests.s_testMacs4231[6]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L110
	HmacSha256_Rfc4231_7(): void {
		this.verifyHmac(7, HmacSha256Tests.s_testMacs4231[7]);
	}

	// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha256Tests.cs#L116
	HmacSha256_Rfc2104_2(): void {
		this.verifyHmacRfc2104_2();
	}

	// TODO
}

function testHmacSha256(hmacSha256Tests: HmacSha256Tests): void {
	testHmac(hmacSha256Tests);

	test('HmacSha256_Rfc4231_1', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_1();
	});

	test('HmacSha256_Rfc4231_2', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_2();
	});

	test('HmacSha256_Rfc4231_3', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_3();
	});

	test('HmacSha256_Rfc4231_4', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_4();
	});

	test('HmacSha256_Rfc4231_5', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_5();
	});

	test('HmacSha256_Rfc4231_6', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_6();
	});

	test('HmacSha256_Rfc4231_7', () => {
		hmacSha256Tests.HmacSha256_Rfc4231_7();
	});

	test('HmacSha256_Rfc2104_2', () => {
		hmacSha256Tests.HmacSha256_Rfc2104_2();
	});
}

testHmacSha256(new HmacSha256Tests());
