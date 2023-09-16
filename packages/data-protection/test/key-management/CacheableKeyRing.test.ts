import { TimeSpan } from '@yohira/base';
import { CacheableKeyRing, IKeyRing } from '@yohira/data-protection';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/CacheableKeyRingTests.cs#L12
test('IsValid_NullKeyRing_ReturnsFalse', () => {
	expect(CacheableKeyRing.isValid(undefined, Date.now())).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/CacheableKeyRingTests.cs#L18
test('IsValid_CancellationTokenTriggered_ReturnsFalse', () => {
	const keyRing: IKeyRing = {} as IKeyRing;
	const now = Date.now();
	// TODO: const cts =
	const cacheableKeyRing = new CacheableKeyRing(
		// TODO: cts.token,
		now + TimeSpan.fromHours(1).totalMilliseconds,
		keyRing,
	);

	expect(CacheableKeyRing.isValid(cacheableKeyRing, now)).toBe(true);
	// TODO: cts.cancel();
	// TODO: expect(CacheableKeyRing.isValid(cacheableKeyRing, now)).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/CacheableKeyRingTests.cs#L33
test('IsValid_Expired_ReturnsFalse', () => {
	const keyRing: IKeyRing = {} as IKeyRing;
	const now = Date.now();
	// TODO: const cts =
	const cacheableKeyRing = new CacheableKeyRing(
		// TODO: cts.token,
		now + TimeSpan.fromHours(1).totalMilliseconds,
		keyRing,
	);

	expect(CacheableKeyRing.isValid(cacheableKeyRing, now)).toBe(true);
	expect(
		CacheableKeyRing.isValid(
			cacheableKeyRing,
			now + TimeSpan.fromHours(1).totalMilliseconds,
		),
	).toBe(false);
});

// https://github.com/dotnet/aspnetcore/blob/2745e0b1e0b8bdfe428d8d115cae0d0f42bcea7b/src/DataProtection/DataProtection/test/KeyManagement/CacheableKeyRingTests.cs#L47
test('KeyRing_Prop', () => {
	const keyRing: IKeyRing = {} as IKeyRing;
	const cacheableKeyRing = new CacheableKeyRing(
		// TODO
		Date.now(),
		keyRing,
	);

	expect(cacheableKeyRing.keyRing === keyRing).toBe(true);
});
