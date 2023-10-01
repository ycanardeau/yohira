export const IItemsFeature = Symbol.for('IItemsFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IItemsFeature.cs,97c9fd6b8ac22b5b,references
/**
 * Provides a key/value collection that can be used to share data within the scope of this request.
 */
export interface IItemsFeature {
	/**
	 * Gets or sets a a key/value collection that can be used to share data within the scope of this request.
	 */
	items: Map<unknown /* TODO */, unknown /* TODO */ | undefined>;
}
