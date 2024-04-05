import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from './FileResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/PhysicalFileResult.cs,05040981b19bb6ea,references
/**
 * A {@link FileResult} on execution will write a file from disk to the response
 * using mechanisms provided by the host.
 */
export class PhysicalFileResult extends FileResult {
	/**
	 * Creates a new {@link PhysicalFileResult} instance with
	 * the provided {@link fileName} and the provided {@link contentType}.
	 * @param fileName The path to the file. The path must be an absolute path.
	 * @param contentType The Content-Type header of the response.
	 */
	constructor(
		/**
		 * Gets or sets the path to the file that will be sent back as the response.
		 */
		public fileName: string,
		contentType: MediaTypeHeaderValue,
	) {
		super(contentType.toString());
	}

	executeResult(context: ActionContext): Promise<void> {
		const executor = getRequiredService<
			IActionResultExecutor<PhysicalFileResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<PhysicalFileResult>'),
		);
		return executor.execute(context, this);
	}
}
