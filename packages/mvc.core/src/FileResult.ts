import { ActionResult } from './ActionResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/FileResult.cs,e0b356bfd80ff9ae,references
/**
 * Represents an {@link ActionResult} that when executed will
 * write a file as the response.
 */
export abstract class FileResult extends ActionResult {
	/**
	 * Creates a new {@link FileResult} instance with
	 * the provided {@link contentType}.
	 * @param contentType The Content-Type header of the response.
	 */
	protected constructor(
		/**
		 * Gets the Content-Type header for the response.
		 */
		readonly contentType: string,
	) {
		super();
	}
}
