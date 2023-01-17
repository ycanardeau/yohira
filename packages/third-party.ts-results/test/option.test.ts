import {
	Err,
	None,
	Ok,
	Option,
	OptionSomeType,
	Result,
	Some,
} from '@yohira/third-party.ts-results';
import { expect, test } from 'vitest';

import { eq } from './util';

const someString = new Some('foo');
const someNum = new Some(10);

test('basic invariants', () => {
	expect(someString.some).toBeTruthy();
	expect(someNum.some).toBeTruthy();
	expect(None).toBe(None);
	expect(someString.val).toBe('foo');
	expect(someNum.val).toBe(10);

	expect(Option.isOption(someString)).toBe(true);
	expect(Option.isOption(someNum)).toBe(true);
	expect(Option.isOption(None)).toBe(true);
	expect(Option.isOption('foo')).toBe(false);
});

test('type narrowing', () => {
	const opt = None as Option<string>;
	if (opt.some) {
		eq<typeof opt, Some<string>>(true);
		eq<typeof opt.val, string>(true);
	} else {
		eq<typeof opt, None>(true);
	}

	if (!opt.some) {
		eq<typeof opt, None>(true);
	} else {
		eq<typeof opt, Some<string>>(true);
		eq<typeof opt.val, string>(true);
	}

	if (opt.none) {
		eq<typeof opt, None>(true);
	} else {
		eq<typeof opt, Some<string>>(true);
		eq<typeof opt.val, string>(true);
	}

	if (!opt.none) {
		eq<typeof opt, Some<string>>(true);
		eq<typeof opt.val, string>(true);
	} else {
		eq<typeof opt, None>(true);
	}

	expect(someString).toBeInstanceOf(Some);
	expect(None).toEqual(None);
});

test('unwrap', () => {
	expect(() => someString.unwrap()).not.toThrow();
	expect(someString.unwrap()).toBe('foo');
	expect(someString.expect('msg')).toBe('foo');
	expect(someString.unwrapOr('bar')).toBe('foo');
	expect(someString.safeUnwrap()).toBe('foo');
	expect(() => None.unwrap()).toThrow(/Tried to unwrap None/);
	expect(() => None.expect('foobar')).toThrow(/foobar/);
	expect(None.unwrapOr('honk')).toBe('honk');
});

test('map / andThen', () => {
	expect(None.map(() => 1)).toBe(None);
	expect(None.andThen(() => 1)).toBe(None);
	expect(None.andThen(() => new Some(1))).toBe(None);

	expect(someString.map(() => 1)).toEqual(new Some(1));
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	someString.andThen(() => 1);
	expect(someString.andThen(() => new Some(1))).toEqual(new Some(1));

	const mapped = (someString as Option<string>).andThen(
		(val) => new Some(!!val),
	);
	expect(mapped).toEqual(new Some(true));
	eq<typeof mapped, Option<boolean>>(true);
});

test('all / any', () => {
	const strings = ['foo', 'bar', 'baz'] as const;
	const options = [
		new Some('foo' as const),
		new Some('bar' as const),
		new Some('baz' as const),
	] as const;

	const all = Option.all(...options);
	eq<typeof all, Option<['foo', 'bar', 'baz']>>(true);

	expect(Option.all(...options)).toEqual(new Some(strings));
	expect(Option.all()).toEqual(new Some([]));
	expect(Option.all(...options, None)).toEqual(None);

	expect(Option.any(...options)).toEqual(new Some('foo'));
	expect(Option.any(...options, None)).toEqual(new Some('foo'));
	expect(Option.any(None, None)).toEqual(None);
	expect(Option.any()).toEqual(None);
});

test('Type Helpers', () => {
	eq<OptionSomeType<Option<string>>, string>(true);
	eq<OptionSomeType<Some<string>>, string>(true);
	eq<OptionSomeType<None>, never>(true);
});

test('to string', () => {
	expect(`${new Some(1)}`).toEqual('Some(1)');
	expect(`${new Some({ name: 'George' })}`).toEqual(
		'Some({"name":"George"})',
	);
	expect(`${None}`).toEqual('None');
});

test('to result', () => {
	const option = new Some(1) as Option<number>;
	const result = option.toResult('error');
	eq<typeof result, Result<number, string>>(true);

	expect(result).toMatchResult(new Ok(1));

	const option2 = None as Option<number>;
	const result2 = option2.toResult('error');
	eq<typeof result2, Result<number, string>>(true);

	expect(result2).toMatchResult(new Err('error'));
});
