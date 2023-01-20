import { Ctor, Type } from '@yohira/base';

import { IFeatureCollection } from './IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureReferences.cs,f92cfeae16318a36,references
/**
 * A reference to a collection of features.
 */
export class FeatureReferences<TCache> {
	/**
	 * Gets the {@link IFeatureCollection}.
	 */
	collection!: IFeatureCollection;

	/**
	 * Gets the revision number.
	 */
	revision = 0;

	cache: TCache;

	constructor(private readonly cacheCtor: Ctor<TCache>) {
		this.cache = new cacheCtor();
	}

	initialize(collection: IFeatureCollection): void {
		this.collection = collection;
	}

	private updateCached<TFeature, TState>(
		featureType: Type,
		cached: {
			get: () => TFeature | undefined;
			set: (value: TFeature | undefined) => void;
		},
		state: TState,
		factory: (state: TState) => TFeature | undefined,
		revision: number,
		flush: boolean,
	): TFeature | undefined {
		if (flush) {
			// Collection detected as changed, clear cache
			this.cache = new this.cacheCtor();
		}

		let cachedValue = this.collection.get<TFeature>(featureType);
		cached.set(cachedValue);
		if (cachedValue === undefined) {
			// Item not in collection, create it with factory
			cachedValue = factory(state);
			cached.set(cachedValue);
			// Add item to IFeatureCollection
			this.collection.set(featureType, cachedValue);
			// Revision changed by .Set, update revision to new value
			this.revision = this.collection.revision;
		} else if (flush) {
			this.revision = revision;
		}

		return cachedValue;
	}

	fetch<TFeature, TState>(
		featureType: Type,
		cached: {
			get: () => TFeature | undefined;
			set: (value: TFeature | undefined) => void;
		},
		state: TState,
		factory: (state: TState) => TFeature | undefined,
	): TFeature | undefined {
		let flush = false;
		if (this.collection === undefined) {
			throw new Error('IFeatureCollection has been disposed.');
		}
		const revision = this.collection.revision;
		if (this.revision !== revision) {
			cached.set(undefined);
			flush = true;
		}

		return (
			cached.get() ??
			this.updateCached(
				featureType,
				cached,
				state,
				factory,
				revision,
				flush,
			)
		);
	}
}
