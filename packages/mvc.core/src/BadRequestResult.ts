import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/BadRequestResult.cs,b2cfd4e609bdae57,references
/**
 * A {@link StatusCodeResult} that when
 * executed will produce a Bad Request (400) response.
 */
export class BadRequestResult extends StatusCodeResult {
	private static readonly defaultStatusCode = StatusCodes.Status400BadRequest;

	/**
	 * Creates a new {@link BadRequestResult} instance.
	 */
	constructor() {
		super(BadRequestResult.defaultStatusCode);
	}
}
