import { IReadonlyList } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointMetadataCollection.cs,1e3e563632786f2c,references
export class EndpointMetadataCollection implements IReadonlyList<object> {
	private readonly items: object[];

	constructor(items: Iterable<object>) {
		this.items = Array.from(items);
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
}
