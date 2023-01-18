import { IEquatable } from '@yohira/base';

export class PathSegment implements IEquatable<PathSegment> {
	constructor(readonly start: number, readonly length: number) {}

	static readonly empty = new PathSegment(0, 0);

	static equals(
		left: PathSegment | undefined,
		right: PathSegment | undefined,
	): boolean {
		if (left === undefined && right === undefined) {
			return true;
		}

		if (left === undefined || right === undefined) {
			return false;
		}

		return left.start === right.start && left.length === right.length;
	}

	equals(other: PathSegment | undefined): boolean {
		return PathSegment.equals(this, other);
	}

	getHashCode(): number {
		return this.start;
	}

	toString(): string {
		return `Segment(${this.start}:${this.length})`;
	}
}
