import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/OkResult.cs,bff0c4d7fa7c0043,references
/**
 * An {@link StatusCodeResult} that when executed will produce an empty
 * {@link StatusCodes.Status200OK} response.
 */
export class OkResult extends StatusCodeResult {
	private static readonly defaultStatusCode = StatusCodes.Status200OK;

	/**
	 * Initializes a new instance of the {@link OkResult} class.
	 */
	constructor() {
		super(OkResult.defaultStatusCode);
	}
}
