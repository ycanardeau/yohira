import { HMAC, HMACSHA512, HashAlgorithm, SHA512 } from '@yohira/cryptography';
import { Result } from '@yohira/third-party.ts-results';
import { test } from 'vitest';

import { testHmac } from './HmacTests';
import { Rfc4231HmacTests } from './Rfc4231HmacTests';

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/HmacSha512Tests.cs#LL12C18-L12C33
class HmacSha512Tests extends Rfc4231HmacTests {
	private static readonly s_testMacs4231 = [
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		undefined!,
		Buffer.from(
			'87aa7cdea5ef619d4ff0b4241a1d6cb02379f4e2ce4ec2787ad0b30545e17cdedaa833b7d6b8a702038b274eaea3f4e4be9d914eeb61f1702e696c203a126854',
			'hex',
		),
		Buffer.from(
			'164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737',
			'hex',
		),
		Buffer.from(
			'fa73b0089d56a284efb0f0756c890be9b1b5dbdd8ee81a3655f83e33b2279d39bf3e848279a722c806b485a47e67c807b946a337bee8942674278859e13292fb',
			'hex',
		),
		Buffer.from(
			'b0ba465637458c6990e5a8c5f61d4af7e576d97ff94b872de76f8050361ee3dba91ca5c11aa25eb4d679275cc5788063a5f19741120c4f2de2adebeb10a298dd',
			'hex',
		),
		// RFC 4231 only defines the first 128 bits of this value.
		Buffer.from('415fad6271580a531d4179bc891d87a6', 'hex'),
		Buffer.from(
			'80b24263c7c1a3ebb71493c1dd7be8b49b46d1f41b4aeec1121b013783f8f3526b56d037e05f2598bd0fd2215d6a1e5295e64f73f63f0aec8b915a985d786598',
			'hex',
		),
		Buffer.from(
			'e37b6a775dc87dbaa4dfa9f96e5e3ffddebd71f8867289865df5a32d20cdc944b6022cac3c4982b10d5eeb55c3e4de15134676fb6de0446065c97440fa8c6a58',
			'hex',
		),
	];

	constructor() {
		super(HmacSha512Tests.s_testMacs4231);
	}

	protected get blockSize(): number {
		return 128;
	}

	protected get macSize(): number {
		return HMACSHA512.hashSizeInBytes;
	}

	protected create(): HMAC {
		return new HMACSHA512();
	}

	protected createHashAlgorithm(): HashAlgorithm {
		return SHA512.create();
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
			return HMACSHA512.hashData(key, source, destination);
		} else {
			return HMACSHA512.hashData(key, source);
		}
	}

	protected tryHashDataOneShot(
		key: Buffer,
		source: Buffer,
		destination: Buffer,
	): Result<number, number> {
		return HMACSHA512.tryHashData(key, source, destination);
	}

	ProduceLegacyHmacValues(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	HmacSha512_Rfc4231_1(): void {
		this.verifyHmac(1, HmacSha512Tests.s_testMacs4231[1]);
	}

	HmacSha512_Rfc4231_2(): void {
		this.verifyHmac(2, HmacSha512Tests.s_testMacs4231[2]);
	}

	HmacSha512_Rfc4231_3(): void {
		this.verifyHmac(3, HmacSha512Tests.s_testMacs4231[3]);
	}

	HmacSha512_Rfc4231_4(): void {
		this.verifyHmac(4, HmacSha512Tests.s_testMacs4231[4]);
	}

	HmacSha512_Rfc4231_5(): void {
		this.verifyHmac(5, HmacSha512Tests.s_testMacs4231[5]);
	}

	HmacSha512_Rfc4231_6(): void {
		this.verifyHmac(6, HmacSha512Tests.s_testMacs4231[6]);
	}

	HmacSha512_Rfc4231_7(): void {
		this.verifyHmac(7, HmacSha512Tests.s_testMacs4231[7]);
	}

	HmacSha512_Rfc2104_2(): void {
		this.verifyHmacRfc2104_2();
	}

	// TODO
}

function testHmacSha512(hmacSha512Tests: HmacSha512Tests): void {
	testHmac(hmacSha512Tests);

	/* TODO: test('ProduceLegacyHmacValues', () => {
		hmacSha512Tests.ProduceLegacyHmacValues();
	}); */

	test('HmacSha512_Rfc4231_1', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_1();
	});

	test('HmacSha512_Rfc4231_2', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_2();
	});

	test('HmacSha512_Rfc4231_3', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_3();
	});

	test('HmacSha512_Rfc4231_4', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_4();
	});

	test('HmacSha512_Rfc4231_5', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_5();
	});

	test('HmacSha512_Rfc4231_6', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_6();
	});

	test('HmacSha512_Rfc4231_7', () => {
		hmacSha512Tests.HmacSha512_Rfc4231_7();
	});

	test('HmacSha512_Rfc2104_2', () => {
		hmacSha512Tests.HmacSha512_Rfc2104_2();
	});

	// TODO
}

testHmacSha512(new HmacSha512Tests());
