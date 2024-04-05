import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { StatusCodes } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';
import { IStatusCodeActionResult } from './IStatusCodeActionResult';
import { IActionResultExecutor } from './infrastructure/IActionResultExecutor';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/JsonResult.cs,d08729fc2595ea03,references
/**
 * An action result which formats the given object as JSON.
 */
export class JsonResult
	extends ActionResult
	implements IStatusCodeActionResult
{
	/**
	 * Gets or sets the <see cref="Net.Http.Headers.MediaTypeHeaderValue"/> representing the Content-Type header of the response.
	 */
	contentType: string | undefined;

	/**
	 * Gets or sets the HTTP status code.
	 */
	statusCode: StatusCodes | undefined;

	/**
	 * Creates a new {@link JsonResult} with the given {@link value}.
	 * @param value The value to format as JSON.
	 */
	constructor(
		/**
		 * Gets or sets the value to be formatted.
		 */
		public value: unknown,
	) {
		super();
	}

	executeResult(context: ActionContext): Promise<void> {
		const services = context.httpContext.requestServices;
		const executor = getRequiredService<IActionResultExecutor<JsonResult>>(
			services,
			Symbol.for('IActionResultExecutor<JsonResult>'),
		);
		return executor.execute(context, this);
	}
}
