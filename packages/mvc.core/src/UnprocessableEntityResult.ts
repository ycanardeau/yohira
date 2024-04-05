import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/UnprocessableEntityResult.cs,4b5cc7cedb08293b,references
/**
 * A {@link StatusCodeResult} that when
 * executed will produce a Unprocessable Entity (422) response.
 */
export class UnprocessableEntityResult extends StatusCodeResult {
	private static readonly defaultStatusCode =
		StatusCodes.Status422UnprocessableEntity;

	/**
	 * Creates a new {@link UnprocessableEntityResult} instance.
	 */
	constructor() {
		super(UnprocessableEntityResult.defaultStatusCode);
	}
}
