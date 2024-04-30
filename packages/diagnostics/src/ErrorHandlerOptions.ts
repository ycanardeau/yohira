import { PathString, RequestDelegate } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Diagnostics/ExceptionHandler/ExceptionHandlerOptions.cs,d3f21ea88088462c,references
/**
 * Options for configuring the {@link ExceptionHandlerMiddleware}.
 */
export class ErrorHandlerOptions {
	/**
	 * The path to the exception handling endpoint. This path will be used when executing
	 * the {@link ErrorHandler}.
	 */
	errorHandlingPath = new PathString(undefined);

	/**
	 * The {@link RequestDelegate} that will handle the exception. If this is not
	 * explicitly provided, the subsequent middleware pipeline will be used by default.
	 */
	errorHandler?: RequestDelegate;
}
