import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';

import { ContentResult } from '../ContentResult';
import { IActionResultExecutor } from './IActionResultExecutor';

function logContentResultExecuting(logger: ILogger, contentType: string): void {
	logger.log(
		LogLevel.Information,
		`Executing ContentResult with HTTP Response ContentType of ${contentType}`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/ContentResultExecutor.cs,f844f7d2e968471f,references
/**
 * A {@link IActionResultExecutor<ContentResult>} that is responsible for {@link ContentResult}
 */
export class ContentResultExecutor
	implements IActionResultExecutor<ContentResult>
{
	private static readonly defaultContentType = 'text/plain; charset=utf-8';

	constructor(
		@inject(Symbol.for('ILoggerT<ContentResultExecutor>'))
		private readonly logger: ILoggerT<ContentResultExecutor>, // TODO: private readonly httpResponseStreamWriterFactory: IHttpResponseStreamWriterFactory,
	) {}

	async execute(
		context: ActionContext,
		result: ContentResult,
	): Promise<void> {
		const response = context.httpContext.response;

		// TODO
		const resolvedContentType = ContentResultExecutor.defaultContentType;

		response.contentType = resolvedContentType;

		if (result.statusCode !== undefined) {
			response.statusCode = result.statusCode;
		}

		logContentResultExecuting(this.logger, resolvedContentType);

		if (result.content !== undefined) {
			throw new Error('Method not implemented.');
		}
	}
}
