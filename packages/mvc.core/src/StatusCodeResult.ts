import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { StatusCodes } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ActionResult } from './ActionResult';
import { IClientErrorActionResult } from './IClientErrorActionResult';

function logHttpStatusCodeResultExecuting(
	logger: ILogger,
	statusCode: number,
): void {
	logger.log(
		LogLevel.Information,
		`Executing StatusCodeResult, setting HTTP status code ${statusCode}`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/StatusCodeResult.cs,4fb2d3522b012641,references
/**
 * Represents an <see cref="ActionResult"/> that when executed will
 * produce an HTTP response with the given response status code.
 */
export class StatusCodeResult
	extends ActionResult
	implements IClientErrorActionResult
{
	/**
	 * Initializes a new instance of the {@link StatusCodeResult} class
	 * with the given {@link statusCode}.
	 * @param statusCode The HTTP status code of the response.
	 */
	constructor(
		/**
		 * Gets the HTTP status code.
		 */
		readonly statusCode: StatusCodes,
	) {
		super();
	}

	executeResultSync(context: ActionContext): void {
		const httpContext = context.httpContext;
		const factory = getRequiredService<ILoggerFactory>(
			httpContext.requestServices,
			ILoggerFactory,
		);
		const logger = factory.createLogger(StatusCodeResult.name);
		logHttpStatusCodeResultExecuting(logger, this.statusCode);

		httpContext.response.statusCode = this.statusCode;
	}
}
