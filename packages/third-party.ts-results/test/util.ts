import { Result } from '@yohira/third-party.ts-results';
import { IsExact, IsNever } from 'conditional-type-checks';
import { Observable } from 'rxjs';
import { expect } from 'vitest';

export function expect_string<T>(x: T, y: IsExact<T, string>): void {}

export function expect_never<T>(x: T, y: IsNever<T>): void {}

export function eq<A, B>(x: IsExact<A, B>): void {}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		interface Matchers<R> {
			toMatchResult(result: Result<any, any>): R;

			toMatchObsResult(result: Result<any, any>): R;

			toMatchObs(value: any): R;
		}
	}
}

expect.extend({
	toMatchResult(received: Result<any, any>, result: Result<any, any>) {
		let pass = true;
		try {
			expect(received.ok).toBe(result.ok);

			if (received.val !== result.val) {
				expect(received.val).toMatchObject(result.val);
			}
		} catch (e) {
			pass = false;
		}

		const type = received.ok ? 'Ok' : 'Err';
		const expectedType = received.ok ? 'Ok' : 'Err';
		const val = JSON.stringify(received.val);
		const expectedVal = JSON.stringify(result.val);

		return {
			message: (): string =>
				`expected ${type}(${val}) ${
					pass ? '' : 'not '
				}to equal ${expectedType}(${expectedVal})`,
			pass,
		};
	},
	toMatchObsResult(
		obs: Observable<Result<any, any>>,
		result: Result<any, any>,
	) {
		let pass = true;

		let received: Result<any, any> | undefined;
		try {
			obs.subscribe((val) => (received = val)).unsubscribe();

			expect(received?.ok).toBe(result.ok);

			if (received?.val !== result.val) {
				expect(received?.val).toMatchObject(result.val);
			}
		} catch (e) {
			pass = false;
		}

		const type = received?.ok ? 'Ok' : 'Err';
		const expectedType = received?.ok ? 'Ok' : 'Err';
		const val = JSON.stringify(received?.val);
		const expectedVal = JSON.stringify(result.val);

		return {
			message: (): string =>
				`expected ${type}(${val}) ${
					pass ? '' : 'not '
				}to equal ${expectedType}(${expectedVal})`,
			pass,
		};
	},
	toMatchObs(obs: Observable<any>, value: any) {
		let pass = true;

		let received: any | undefined;
		try {
			obs.subscribe((val) => (received = val)).unsubscribe();

			expect(received).toEqual(value);
		} catch (e) {
			pass = false;
		}

		return {
			message: (): string =>
				`expected observable value: ${JSON.stringify(
					value,
				)}\n\nFound: ${JSON.stringify(received)}`,
			pass,
		};
	},
});
