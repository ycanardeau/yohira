import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';
import { Readable } from 'node:stream';

import { FileResult } from './FileResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/FileStreamResult.cs,5fe9f44b458c7433,references
/**
 * Represents an {@link ActionResult} that when executed will
 * write a file from a stream to the response.
 */
export class FileStreamResult extends FileResult {
	/**
	 * Creates a new {@link FileStreamResult} instance with
	 * the provided {@link fileStream} and the
	 * provided {@link contentType}.
	 * @param fileStream The stream with the file.
	 * @param contentType The Content-Type header of the response.
	 */
	constructor(
		/**
		 * Gets or sets the stream with the file that will be sent back as the response.
		 */
		public fileStream: Readable,
		contentType: MediaTypeHeaderValue,
	) {
		super(contentType.toString());
	}

	executeResult(context: ActionContext): Promise<void> {
		const executor = getRequiredService<
			IActionResultExecutor<FileStreamResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<FileStreamResult>'),
		);
		return executor.execute(context, this);
	}
}
