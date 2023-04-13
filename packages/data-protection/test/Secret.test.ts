import { Guid } from '@yohira/base';
import { Secret } from '@yohira/data-protection';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L11
test('Ctor_ArraySegment_Default_Throws', () => {
	expect(() => new Secret(undefined!)).toThrowError(
		'Value cannot be undefined.',
	);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L21
test('Ctor_ArraySegment_Success', () => {
	const input = Buffer.from(
		[0x10, 0x20, 0x30, 0x40, 0x50, 0x60].slice(1, 1 + 3),
	);

	const secret = new Secret(input);
	input[2] = 0xff; // mutate original array - secret shouldn't be modified

	expect(secret.length).toBe(3);

	const outputSegment = Buffer.alloc(7).subarray(2, 2 + 3);
	secret.writeSecretIntoBuffer(outputSegment);
	expect(outputSegment.equals(Buffer.from([0x20, 0x30, 0x40]))).toBe(true);

	const outputBuffer = Buffer.alloc(3);
	secret.writeSecretIntoBuffer(outputBuffer, 3);
	expect(outputBuffer.equals(Buffer.from([0x20, 0x30, 0x40]))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L48
test('Ctor_Buffer_Success', () => {
	const input = Buffer.from([0x20, 0x30, 0x40]);

	const secret = new Secret(input);
	input[1] = 0xff; // mutate original array - secret shouldn't be modified

	expect(secret.length).toBe(3);

	const outputSegment = Buffer.alloc(7).subarray(2, 2 + 3);
	secret.writeSecretIntoBuffer(outputSegment);
	expect(outputSegment.equals(Buffer.from([0x20, 0x30, 0x40]))).toBe(true);

	const outputBuffer = Buffer.alloc(3);
	secret.writeSecretIntoBuffer(outputBuffer, 3);
	expect(outputBuffer.equals(Buffer.from([0x20, 0x30, 0x40]))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L75
test('Ctor_Buffer_ZeroLength_Success', () => {
	const secret = new Secret(Buffer.alloc(0));

	expect(secret.length).toBe(0);
	secret.writeSecretIntoBuffer(Buffer.alloc(0));
	secret.writeSecretIntoBuffer(Buffer.alloc(0), 0);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L157
test('Random_ZeroLength_Success', () => {
	const secret = Secret.random(0);

	expect(secret.length).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L167
test('Random_LengthIsMultipleOf16_Success', () => {
	const secret = Secret.random(32);

	expect(secret.length).toBe(32);
	const buffer = Buffer.alloc(32);
	secret.writeSecretIntoBuffer(buffer);
	const guids = [
		Guid.fromBuffer(buffer.subarray(0, 16)),
		Guid.fromBuffer(buffer.subarray(16, 32)),
	];
	expect(guids[0].equals(Guid.empty)).toBe(false);
	expect(guids[1].equals(Guid.empty)).toBe(false);
	expect(guids[0].equals(guids[1])).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L182
test('Random_LengthIsNotMultipleOf16_Success', () => {
	const secret = Secret.random(31);

	expect(secret.length).toBe(31);
	const buffer = Buffer.alloc(32);
	secret.writeSecretIntoBuffer(buffer, 31);
	const guids = [
		Guid.fromBuffer(buffer.subarray(0, 16)),
		Guid.fromBuffer(buffer.subarray(16, 32)),
	];
	expect(guids[0].equals(Guid.empty)).toBe(false);
	expect(guids[1].equals(Guid.empty)).toBe(false);
	expect(guids[0].equals(guids[1])).toBe(false);
	expect(buffer[31]).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/SecretTests.cs#L198
test('WriteSecretIntoBuffer_ArraySegment_IncorrectlySizedBuffer_Throws', () => {
	const secret = Secret.random(16);

	expect(() => secret.writeSecretIntoBuffer(Buffer.alloc(100))).toThrowError(
		'The provided buffer is of length 100 byte(s). It must instead be exactly 16 byte(s) in length.',
	);
});

// TODO
