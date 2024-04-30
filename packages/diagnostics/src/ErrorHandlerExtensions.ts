import { tryGetValue } from '@yohira/base';
import { getRequiredService } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { IOptions, createOptions } from '@yohira/extensions.options';
import {
	IAppBuilder,
	IProblemDetailsService,
	PathString,
	use,
	useMiddleware,
} from '@yohira/http.abstractions';
import { globalRouteBuilderKey, reroute } from '@yohira/shared';

import { ErrorHandlerMiddlewareImpl } from './ErrorHandlerMiddlewareImpl';
import { ErrorHandlerOptions } from './ErrorHandlerOptions';

// https://source.dot.net/#Microsoft.AspNetCore.Diagnostics/ExceptionHandler/ExceptionHandlerExtensions.cs,db917ed5fbfda59e,references
function setErrorHandlerMiddleware(
	app: IAppBuilder,
	options: IOptions<ErrorHandlerOptions> | undefined,
): IAppBuilder {
	const problemDetailsService =
		app.appServices.getService<IProblemDetailsService>(
			IProblemDetailsService,
		);

	// Only use this path if there's a global router (in the 'WebApplication' case).
	const routeBuilder = tryGetValue(app.properties, globalRouteBuilderKey);
	if (routeBuilder.ok) {
		return use(app, (context, next) => {
			const loggerFactory = getRequiredService<ILoggerFactory>(
				app.appServices,
				ILoggerFactory,
			);
			// TODO

			if (options === undefined) {
				options = getRequiredService<IOptions<ErrorHandlerOptions>>(
					app.appServices,
					Symbol.for('IOptions<ErrorHandlerOptions>'),
				);
			}

			if (
				!!options
					.getValue(ErrorHandlerOptions)
					.errorHandlingPath.toString() &&
				options.getValue(ErrorHandlerOptions).errorHandler === undefined
			) {
				const newNext = reroute(app, routeBuilder, next);
				// store the pipeline for the error case
				options.getValue(ErrorHandlerOptions).errorHandler = newNext;
			}

			return new ErrorHandlerMiddlewareImpl(
				loggerFactory,
				options,
				// TODO: diagnosticListener,
				// TODO: errorHandlers,
				// TODO: meterFactory,
				problemDetailsService,
			).invoke(context, next);
		});
	}

	if (options === undefined) {
		return useMiddleware(ErrorHandlerMiddlewareImpl, app);
	}

	// TODO
	throw new Error('Method not implemented.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Diagnostics/ExceptionHandler/ExceptionHandlerExtensions.cs,83bc892dac4bba84,references
/**
 * Adds a middleware to the pipeline that will catch exceptions, log them, and re-execute the request in an alternate pipeline.
 * The request will not be re-executed if the response has already started.
 * @param app
 * @param options
 * @returns
 */
export function useErrorHandlerWithOptions(
	app: IAppBuilder,
	options: ErrorHandlerOptions,
): IAppBuilder {
	const iOptions = createOptions(options);
	return setErrorHandlerMiddleware(app, iOptions);
}

// https://source.dot.net/#Microsoft.AspNetCore.Diagnostics/ExceptionHandler/ExceptionHandlerExtensions.cs,851388d0ab63af50,references
/**
 * Adds a middleware to the pipeline that will catch errors, log them, and re-execute the request in an alternate pipeline.
 * The request will not be re-executed if the response has already started.
 * @param app
 * @returns
 */
export function useErrorHandler(
	app: IAppBuilder,
	errorHandlingPath?: string,
): IAppBuilder {
	if (errorHandlingPath === undefined) {
		return setErrorHandlerMiddleware(app, undefined);
	} else {
		return useErrorHandlerWithOptions(
			app,
			((): ErrorHandlerOptions => {
				const options = new ErrorHandlerOptions();
				options.errorHandlingPath = new PathString(errorHandlingPath);
				return options;
			})(),
		);
	}
}
