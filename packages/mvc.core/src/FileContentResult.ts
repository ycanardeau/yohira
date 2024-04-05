import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from './FileResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/FileContentResult.cs,56dfc807f1ba9879,references
/**
 * Represents an {@link ActionResult} that when executed will
 * write a binary file to the response.
 */
export class FileContentResult extends FileResult {
	/**
	 * Creates a new {@link FileContentResult} instance with
	 * the provided {@link fileContents} and the
	 * provided {@link contentType}.
	 * @param fileContents The bytes that represent the file contents.
	 * @param contentType The Content-Type header of the response.
	 */
	constructor(
		/**
		 * Gets or sets the file contents.
		 */
		public fileContents: Buffer,
		contentType: MediaTypeHeaderValue,
	) {
		super(contentType.toString());
	}

	executeResult(context: ActionContext): Promise<void> {
		const executor = getRequiredService<
			IActionResultExecutor<FileContentResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<FileContentResult>'),
		);
		return executor.execute(context, this);
	}
}
