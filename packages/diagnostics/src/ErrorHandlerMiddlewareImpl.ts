import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IOptions } from '@yohira/extensions.options';
import {
	IHttpContext,
	IMiddleware,
	IProblemDetailsService,
	RequestDelegate,
} from '@yohira/http.abstractions';

import { ErrorHandlerOptions } from './ErrorHandlerOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Diagnostics/ExceptionHandler/ExceptionHandlerMiddlewareImpl.cs,cdf90ca1b8355f0a,references
/**
 * A middleware for handling exceptions in the application.
 */
export class ErrorHandlerMiddlewareImpl implements IMiddleware {
	private readonly options: ErrorHandlerOptions;
	private readonly logger: ILogger;

	constructor(
		loggerFactory: ILoggerFactory,
		options: IOptions<ErrorHandlerOptions>,
		// TODO: diagnosticListener,
		// TODO: errorHandlers,
		// TODO: meterFactory,
		private readonly problemDetailsService?: IProblemDetailsService,
	) {
		this.options = options.getValue(ErrorHandlerOptions);
		this.logger = loggerFactory.createLogger(
			ErrorHandlerMiddlewareImpl.name,
		);
	}

	async invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		try {
			return await next(context);
		} catch (error) {
			// TODO
			//throw new Error('Method not implemented.')
			console.error(error);
		}
	}
}
