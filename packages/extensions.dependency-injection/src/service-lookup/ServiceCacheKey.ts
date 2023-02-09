import { getStringHashCode } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCacheKey.cs,5f18c3f8ffa0308b,references
export class ServiceCacheKey {
	constructor(readonly type: symbol | undefined, readonly slot: number) {}

	static readonly empty = new ServiceCacheKey(undefined, 0);

	equals(other: ServiceCacheKey): boolean {
		return this.type === other.type && this.slot === other.slot;
	}

	getHashCode(): number {
		return (
			((this.type !== undefined
				? getStringHashCode(Symbol.keyFor(this.type)!)
				: 23) *
				397) ^
			this.slot
		);
	}
}
