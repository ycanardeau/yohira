import { StatusCodes } from '@yohira/http.abstractions';
import { IActionResult } from '@yohira/mvc.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/IStatusCodeActionResult.cs,fdf414535484c844,references
/**
 * Represents an {@link IActionResult} that when executed will
 * produce an HTTP response with the specified {@link StatusCode}.
 */
export interface IStatusCodeActionResult extends IActionResult {
	/**
	 * Gets the HTTP status code.
	 */
	readonly statusCode: StatusCodes | undefined;
}
