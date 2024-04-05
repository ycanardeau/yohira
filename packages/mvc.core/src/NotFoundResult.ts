import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/NotFoundResult.cs,88e9b3b6babb64ea,references
/**
 * Represents an {@link StatusCodeResult} that when
 * executed will produce a Not Found (404) response.
 */
export class NotFoundResult extends StatusCodeResult {
	private static readonly defaultStatusCode = StatusCodes.Status404NotFound;

	/**
	 * Creates a new {@link NotFoundResult} instance.
	 */
	constructor() {
		super(NotFoundResult.defaultStatusCode);
	}
}
