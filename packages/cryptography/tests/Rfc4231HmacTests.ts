import { HmacTests } from './HmacTests';

// https://github.com/dotnet/runtime/blob/ab2b80d06dd4d997df5ffa72a3c4a99cb36ccbff/src/libraries/System.Security.Cryptography/tests/Rfc4231HmacTests.cs#L9
export abstract class Rfc4231HmacTests extends HmacTests {
	private static readonly s_testKeys4231: Buffer[] = [
		undefined!,
		Buffer.alloc(20).fill(0x0b),
		Buffer.from('Jefe'),
		Buffer.alloc(20).fill(0xaa),
		Buffer.from(
			'0102030405060708090a0b0c0d0e0f10111213141516171819',
			'hex',
		),
		Buffer.from('0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c', 'hex'),
		Buffer.alloc(131).fill(0xaa),
		Buffer.alloc(131).fill(0xaa),
	];

	private static readonly s_testData4231: Buffer[] = [
		undefined!,
		Buffer.from('Hi There'),
		Buffer.from('what do ya want for nothing?'),
		Buffer.alloc(50).fill(0xdd),
		Buffer.alloc(50).fill(0xcd),
		Buffer.from('Test With Truncation'),
		Buffer.from('Test Using Larger Than Block-Size Key - Hash Key First'),
		Buffer.from(
			'This is a test using a larger than block-size key and a larger than block-size data. The key needs to be hashed before being used by the HMAC algorithm.',
		),
	];

	protected constructor(testMacs: Buffer[]) {
		super(
			Rfc4231HmacTests.s_testKeys4231,
			Rfc4231HmacTests.s_testData4231,
			testMacs,
		);
	}
}
