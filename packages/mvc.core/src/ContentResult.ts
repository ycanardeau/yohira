import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { StatusCodes } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';
import { IStatusCodeActionResult } from './IStatusCodeActionResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/ContentResult.cs,308da321a6f88190,references
/**
 * An {@link ActionResult} that when executed will produce a response with content.
 */
export class ContentResult
	extends ActionResult
	implements IStatusCodeActionResult
{
	/**
	 * Gets or set the content representing the body of the response.
	 */
	content: string | undefined;

	/**
	 * Gets or sets the Content-Type header for the response,
	 * which may be handled using {@link MediaTypeHeaderValue}.
	 */
	contentType: string | undefined;

	/**
	 * Gets or sets the {@link StatusCodes HTTP status code}</see>.
	 */
	statusCode: StatusCodes | undefined;

	executeResult(context: ActionContext): Promise<void> {
		const executor = getRequiredService<
			IActionResultExecutor<ContentResult>
		>(
			context.httpContext.requestServices,
			Symbol.for('IActionResultExecutor<ContentResult>'),
		);
		return executor.execute(context, this);
	}
}
