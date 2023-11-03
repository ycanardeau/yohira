import {
	EvictionReason,
	ICacheEntry,
} from '@yohira/extensions.caching.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Caching.Memory/CacheEntry.cs,cbca03395cd04b6f,references
export class CacheEntry implements ICacheEntry {
	private _value: object | undefined;
	private isValueSet = false;
	private _evictionReason = EvictionReason.None;

	get value(): object | undefined {
		return this._value;
	}
	set value(value: object | undefined) {
		this._value = value;
		this.isValueSet = true;
	}

	/** @internal */ lastAccessed = 0;

	/** @internal */ get evictionReason(): EvictionReason {
		return this._evictionReason;
	}
	private set evictionReason(value: EvictionReason) {
		this._evictionReason = value;
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ checkExpired(utcNow: number): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}

	/** @internal */ propagateOptionsToCurrent(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
