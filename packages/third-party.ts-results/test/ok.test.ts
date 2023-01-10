import { Err, Ok, Result } from '@yohira/third-party.ts-results/result';
import { assert } from 'conditional-type-checks';
import { expect, test } from 'vitest';

import { eq, expect_never, expect_string } from './util';

test('Constructable & Callable', () => {
	const a = new Ok(3);
	expect(a).toBeInstanceOf(Ok);
	eq<typeof a, Ok<number>>(true);

	const b = new Ok(3);
	expect(b).toBeInstanceOf(Ok);
	eq<typeof b, Ok<number>>(true);

	function mapper<T>(fn: new (val: string) => T): T {
		return new fn('hi');
	}

	const mapped = mapper(Ok);
	expect(mapped).toMatchResult(new Ok('hi'));

	// TODO: This should work!
	// eq<typeof mapped, Ok<string>>(true);

	// @ts-expect-error Ok<string> is not assignable to Ok<number>
	mapper<Ok<number>>(Ok);
});

test('ok, err, and val', () => {
	const err = new Ok(32);
	expect(err.err).toBe(false);
	assert<typeof err.err>(false);

	expect(err.ok).toBe(true);
	assert<typeof err.ok>(true);

	expect(err.val).toBe(32);
	eq<typeof err.val, number>(true);
});

test('static EMPTY', () => {
	expect(Ok.EMPTY).toBeInstanceOf(Ok);
	expect(Ok.EMPTY.val).toBe(undefined);
	eq<typeof Ok.EMPTY, Ok<void>>(true);
});

test('else, unwrapOr', () => {
	const e1 = new Ok(3).else(false);
	expect(e1).toBe(3);
	eq<number, typeof e1>(true);

	const e2 = new Ok(3).unwrapOr(false);
	expect(e2).toBe(3);
	eq<number, typeof e2>(true);
});

test('expect', () => {
	const val = new Ok(true).expect('should not fail!');
	expect(val).toBe(true);
	eq<boolean, typeof val>(true);
});

test('unwrap', () => {
	const val = new Ok(true).unwrap();
	expect(val).toBe(true);
	eq<boolean, typeof val>(true);
});

test('map', () => {
	const mapped = new Ok(3).map((x) => x.toString(10));
	expect(mapped).toMatchResult(new Ok('3'));
	eq<typeof mapped, Ok<string>>(true);
});

test('andThen', () => {
	const ok = new Ok('Ok').andThen(() => new Ok(3));
	expect(ok).toMatchResult(new Ok(3));
	eq<typeof ok, Ok<number>>(true);

	const err = new Ok('Ok').andThen(() => new Err(false));
	expect(err).toMatchResult(new Err(false));
	eq<typeof err, Result<string, boolean>>(true);
});

test('mapErr', () => {
	const ok = new Ok('32').mapErr((x: any) => +x);
	expect(ok).toMatchResult(new Ok('32'));
	eq<typeof ok, Ok<string>>(true);
});

test('iterable', () => {
	let i = 0;
	for (const char of new Ok('hello')) {
		expect('hello'[i]).toBe(char);
		expect_string(char, true);
		i++;
	}

	i = 0;
	for (const item of new Ok([1, 2, 3])) {
		expect([1, 2, 3][i]).toBe(item);
		eq<number, typeof item>(true);
		i++;
	}

	for (const item of new Ok(1)) {
		expect_never(item, true);

		throw new Error(
			'Unreachable, Err@@iterator should emit no value and return',
		);
	}
});

test('to string', () => {
	expect(`${new Ok(1)}`).toEqual('Ok(1)');
	expect(`${new Ok({ name: 'George' })}`).toEqual('Ok({"name":"George"})');
});
