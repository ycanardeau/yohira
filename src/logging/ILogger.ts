// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Logging.Abstractions/src/LogLevel.cs#L9
/**
 * Defines logging severity levels.
 */
export enum LogLevel {
	/**
	 * Logs that contain the most detailed messages. These messages may contain sensitive application data.
	 * These messages are disabled by default and should never be enabled in a production environment.
	 */
	Trace = 0,
	/**
	 * Logs that are used for interactive investigation during development.  These logs should primarily contain
	 * information useful for debugging and have no long-term value.
	 */
	Debug = 1,
	/**
	 * Logs that track the general flow of the application. These logs should have long-term value.
	 */
	Information = 2,
	/**
	 * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the
	 * application execution to stop.
	 */
	Warning = 3,
	/**
	 * Logs that highlight when the current flow of execution is stopped due to a failure. These should indicate a
	 * failure in the current activity, not an application-wide failure.
	 */
	Error = 4,
	/**
	 * Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires
	 * immediate attention.
	 */
	Critical = 5,
	/**
	 * Not used for writing log messages. Specifies that a logging category should not write any messages.
	 */
	None = 6,
}

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Logging.Abstractions/src/ILogger.cs#L12
export interface ILogger {
	isEnabled(logLevel: LogLevel): boolean;
}

// https://github.com/dotnet/runtime/blob/215b39abf947da7a40b0cb137eab4bceb24ad3e3/src/libraries/Microsoft.Extensions.Logging.Abstractions/src/LoggerExtensions.cs#L39
export const logDebug = (
	logger: ILogger,
	eventId: number,
	message: string | undefined,
): void => {
	// TODO
	console.log(eventId, message);
};
