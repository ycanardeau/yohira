import { EntityTagHeaderValue } from '@yohira/http.headers';

import { ActionResult } from './ActionResult';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/FileResult.cs,e0b356bfd80ff9ae,references
/**
 * Represents an {@link ActionResult} that when executed will
 * write a file as the response.
 */
export abstract class FileResult extends ActionResult {
	private _fileDownloadName: string | undefined;

	/**
	 * Gets the file name that will be used in the Content-Disposition header of the response.
	 */
	get fileDownloadName(): string {
		return this._fileDownloadName ?? '';
	}
	set fileDownloadName(value: string) {
		this._fileDownloadName = value;
	}

	/**
	 * Gets or sets the last modified information associated with the {@link FileResult}.
	 */
	lastModified: Date /* TODO: DateTimeOffset */ | undefined;

	/**
	 * Gets or sets the etag associated with the {@link FileResult}.
	 */
	entityTag: EntityTagHeaderValue | undefined;

	/**
	 * Gets or sets the value that enables range processing for the {@link FileResult}.
	 */
	enableRangeProcessing = false;

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
