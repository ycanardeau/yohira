export const IHttpRequestIdentifierFeature = Symbol.for(
	'IHttpRequestIdentifierFeature',
);
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpRequestIdentifierFeature.cs,93b59a731cabe1c4,references
/**
 * Feature to uniquely identify a request.
 */
export interface IHttpRequestIdentifierFeature {
	/**
	 * Gets or sets a value to uniquely identify a request.
	 * This can be used for logging and diagnostics.
	 */
	traceIdentifier: string;
}
