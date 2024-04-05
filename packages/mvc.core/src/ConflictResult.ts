import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/ConflictResult.cs,2052145bc39215a7,references
/**
 * A {@link StatusCodeResult} that when executed will produce a Conflict (409) response.
 */
export class ConflictResult extends StatusCodeResult {
	private static readonly defaultStatusCode = StatusCodes.Status409Conflict;

	/**
	 * Creates a new {@link ConflictResult} instance.
	 */
	constructor() {
		super(ConflictResult.defaultStatusCode);
	}
}
