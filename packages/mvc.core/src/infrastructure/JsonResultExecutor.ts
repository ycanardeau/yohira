import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { StringSegment } from '@yohira/extensions.primitives';
import { write } from '@yohira/http.abstractions';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';

import { JsonResult } from '../JsonResult';
import { IActionResultExecutor } from './IActionResultExecutor';

function logJsonResultExecutingCore(
	logger: ILogger,
	type: string | undefined,
): void {
	logger.log(
		LogLevel.Information,
		`Executing JsonResult, writing value of type '${type}'.`,
	);
}

function logJsonResultExecuting(logger: ILogger, value: unknown): void {
	if (logger.isEnabled(LogLevel.Information)) {
		logJsonResultExecutingCore(logger, '' /* TODO: type */);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/Infrastructure/SystemTextJsonResultExecutor.cs,1a49c81c631d00d5,references
export class JsonResultExecutor
	implements IActionResultExecutor<JsonResult<unknown>>
{
	private static readonly defaultContentType = new MediaTypeHeaderValue(
		StringSegment.from('application/json'),
	).toString();

	constructor(
		@inject(Symbol.for('ILoggerT<JsonResultExecutor>'))
		private readonly logger: ILoggerT<JsonResultExecutor>,
	) {}

	async execute(
		context: ActionContext,
		result: JsonResult<unknown>,
	): Promise<void> {
		const response = context.httpContext.response;

		// TODO
		const resolvedContentType = JsonResultExecutor.defaultContentType;

		response.contentType = resolvedContentType;

		if (result.statusCode !== undefined) {
			response.statusCode = result.statusCode;
		}

		logJsonResultExecuting(this.logger, result.value);

		const value = result.value;

		// TODO
		await write(response, JSON.stringify(value));
	}
}
