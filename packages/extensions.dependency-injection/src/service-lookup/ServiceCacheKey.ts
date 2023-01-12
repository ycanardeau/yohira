import { Type } from '@yohira/base/Type';

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
const getHashCode = (value: string): number => {
	let hashCode = 0;
	if (value.length === 0) {
		return hashCode;
	}
	for (let i = 0; i < value.length; i++) {
		const char = value.charCodeAt(i);
		hashCode = (hashCode << 5) - hashCode + char;
		hashCode = hashCode | 0;
	}
	return hashCode;
};

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection/ServiceLookup/ServiceCacheKey.cs,5f18c3f8ffa0308b,references
export class ServiceCacheKey {
	constructor(readonly type: Type | undefined, readonly slot: number) {}

	static readonly empty = new ServiceCacheKey(undefined, 0);

	equals(other: ServiceCacheKey): boolean {
		return Type.equals(this.type, other.type) && this.slot === other.slot;
	}

	getHashCode(): number {
		return (
			((this.type ? getHashCode(this.type.value) : 23) * 397) ^ this.slot
		);
	}
}
