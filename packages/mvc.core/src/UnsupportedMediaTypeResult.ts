import { StatusCodes } from '@yohira/http.abstractions';

import { StatusCodeResult } from './StatusCodeResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/UnsupportedMediaTypeResult.cs,61b9d17100a655e4,references
/**
 * A {@link StatusCodeResult} that when
 * executed will produce a UnsupportedMediaType (415) response.
 */
export class UnsupportedMediaTypeResult extends StatusCodeResult {
	private static readonly defaultStatusCode =
		StatusCodes.Status415UnsupportedMediaType;

	/**
	 * Creates a new instance of {@link UnsupportedMediaTypeResult}.
	 */
	constructor() {
		super(UnsupportedMediaTypeResult.defaultStatusCode);
	}
}
