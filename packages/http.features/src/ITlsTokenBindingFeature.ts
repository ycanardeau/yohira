export const ITlsTokenBindingFeature = Symbol.for('ITlsTokenBindingFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/ITlsTokenBindingFeature.cs,b92cd4d51308385b,references
export interface ITlsTokenBindingFeature {
	/**
	 * Gets the 'provided' token binding identifier associated with the request.
	 * @returns The token binding identifier, or null if the client did not
	 * supply a 'provided' token binding or valid proof of possession of the
	 * associated private key. The caller should treat this identifier as an
	 * opaque blob and should not try to parse it.
	 */
	getProvidedTokenBindingId(): Buffer;
}
