import { IEquatable } from './IEquatable';

export class Type implements IEquatable<Type> {
	private constructor(readonly value: string) {}

	static from(value: string): Type {
		return new Type(value);
	}

	toString(): string {
		return this.value;
	}

	static equals(left: Type | undefined, right: Type | undefined): boolean {
		if (left === undefined && right === undefined) {
			return true;
		}

		if (left === undefined || right === undefined) {
			return false;
		}

		return left.value === right.value;
	}

	equals(other: Type | undefined): boolean {
		return Type.equals(this, other);
	}
}

export type Ctor<T = unknown> = new (...args: any[]) => T;
