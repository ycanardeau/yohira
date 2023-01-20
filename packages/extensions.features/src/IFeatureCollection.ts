import { Type } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Features/IFeatureCollection.cs,a1176f964a1c46f8,references
/**
 * Represents a collection of HTTP features.
 */
export interface IFeatureCollection {
	/**
	 * Incremented for each modification and can be used to verify cached results.
	 */
	readonly revision: number;
	/**
	 * Retrieves the requested feature from the collection.
	 * @param key The feature key.
	 * @returns The requested feature, or null if it is not present.
	 */
	get<T>(key: Type): T | undefined;
	/**
	 * Sets the given feature in the collection.
	 * @param key The feature key.
	 * @param instance The feature value.
	 */
	set<T>(key: Type, instance: T | undefined): void;
}
