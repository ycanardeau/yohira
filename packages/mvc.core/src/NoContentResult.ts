import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/NoContentResult.cs,0339237f370162ea,references
/**
 * A {@link StatusCodeResult} that when executed will produce a 204 No Content response.
 */
export class NoContentResult extends StatusCodeResult {
	private static readonly defaultStatusCode = StatusCodes.Status204NoContent;

	/**
	 * Initializes a new {@link NoContentResult} instance.
	 */
	constructor() {
		super(NoContentResult.defaultStatusCode);
	}
}
