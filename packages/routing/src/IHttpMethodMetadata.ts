import { HttpMethods } from '@yohira/http.abstractions';

export const IHttpMethodMetadata = Symbol.for('IHttpMethodMetadata');
// https://source.dot.net/#Microsoft.AspNetCore.Routing/IHttpMethodMetadata.cs,3404aba6017edcc5,references
/**
 * Represents HTTP method metadata used during routing.
 */
export interface IHttpMethodMetadata {
	/**
	 * Returns a value indicating whether the associated endpoint should accept CORS preflight requests.
	 */
	acceptCorsPreflight: boolean;
	/**
	 * Returns a read-only collection of HTTP methods used during routing.
	 * An empty collection means any HTTP method will be accepted.
	 */
	readonly httpMethods: readonly HttpMethods[];
}
