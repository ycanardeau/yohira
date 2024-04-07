import {
	IReadonlyList,
	getType,
	isCompatibleWith,
	tryAdd,
	tryGetValue,
} from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointMetadataCollection.cs,1e3e563632786f2c,references
export class EndpointMetadataCollection implements IReadonlyList<object> {
	private readonly items: object[];
	private readonly cache: Map<symbol, object[]>;

	constructor(items: Iterable<object>) {
		this.items = Array.from(items);
		this.cache = new Map();
	}

	static empty(): EndpointMetadataCollection {
		return new EndpointMetadataCollection([]);
	}

	[Symbol.iterator](): Iterator<object> {
		return this.items[Symbol.iterator]();
	}

	get count(): number {
		return this.items.length;
	}

	get(index: number): object {
		return this.items[index];
	}

	private getOrderedMetadataSlow<T extends object>(type: symbol): T[] {
		let matches: T[] | undefined = undefined;

		const items = this.items;
		for (const item of items) {
			if (isCompatibleWith(getType(item), type)) {
				matches ??= [];
				matches.push(item as T);
			}
		}

		const results = matches === undefined ? [] : matches;
		tryAdd(this.cache, type, results);
		return results;
	}

	private getMetadataSlow<T extends object>(type: symbol): T | undefined {
		const result = this.getOrderedMetadataSlow<T>(type);
		const length = result.length;
		return length > 0 ? result[length - 1] : undefined;
	}

	getMetadata<T extends object>(type: symbol): T | undefined {
		const tryGetValueResult = tryGetValue(this.cache, type);
		if (tryGetValueResult.ok) {
			const result = tryGetValueResult.val as T[];
			const length = result.length;
			return length > 0 ? result[length - 1] : undefined;
		}

		return this.getMetadataSlow<T>(type);
	}
}
