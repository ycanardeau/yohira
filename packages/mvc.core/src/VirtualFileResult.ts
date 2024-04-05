import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { IFileProvider } from '@yohira/extensions.file-providers';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { FileResult } from './FileResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/VirtualFileResult.cs,dd8081a66a51c39e,references
/**
 * A {@link FileResult} that on execution writes the file specified using a virtual path to the response
 * using mechanisms provided by the host.
 */
export class VirtualFileResult extends FileResult {
	/**
	 * Gets or sets the {@linik IFileProvider} used to resolve paths.
	 */
	fileProvider: IFileProvider | undefined;

	/**
	 * Creates a new {@link VirtualFileResult} instance with
	 * the provided {@link fileName} and the
	 * provided {@link contentType}.
	 * @param fileName The path to the file. The path must be relative/virtual.
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
			IActionResultExecutor<VirtualFileResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<VirtualFileResult>'),
		);
		return executor.execute(context, this);
	}
}
