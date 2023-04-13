// https://source.dot.net/#Microsoft.Extensions.Caching.Abstractions/EvictionReason.cs,2f8402ec74aa628e,references
export enum EvictionReason {
	None,
	/**
	 * Manually
	 */
	Removed,
	/**
	 * Overwritten
	 */
	Replaced,
	/**
	 * Timed out
	 */
	Expired,
	/**
	 * Event
	 */
	TokenExpired,
	/**
	 * Overflow
	 */
	Capacity,
}
