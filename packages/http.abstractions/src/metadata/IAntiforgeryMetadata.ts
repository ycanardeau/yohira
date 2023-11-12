export const IAntiforgeryMetadata = Symbol.for('IAntiforgeryMetadata');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Metadata/IAntiforgeryMetadata.cs,5f49d4d07fc58320,references
/**
 * A marker interface which can be used to identify antiforgery metadata.
 */
export interface IAntiforgeryMetadata {
	/**
	 * Gets a value indicating whether the antiforgery token should be validated.
	 */
	readonly requiresValidation: boolean;
}
