import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/UnauthorizedResult.cs,4c3c7831bbaf2b94,references
/**
 * Represents an {@link UnauthorizedResult} that when
 * executed will produce an Unauthorized (401) response.
 */
export class UnauthorizedResult extends StatusCodeResult {
	private static readonly defaultStatusCode =
		StatusCodes.Status401Unauthorized;

	/**
	 * Creates a new {@link UnauthorizedResult} instance.
	 */
	constructor() {
		super(UnauthorizedResult.defaultStatusCode);
	}
}
