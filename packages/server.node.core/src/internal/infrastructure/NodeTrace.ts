import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Infrastructure/KestrelTrace.General.cs,c5ba3d8659e3d490,references
function applicationError(
	logger: ILogger,
	connectionId: string,
	traceIdentifier: string,
	error: Error,
): void {
	logger.log(
		LogLevel.Error,
		`Connection id "${connectionId}", Request id "${traceIdentifier}": An unhandled exception was thrown by the application.`,
		error,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Infrastructure/KestrelTrace.cs,5d90ca2860816a1f,references
export class NodeTrace implements ILogger {
	private readonly generalLogger: ILogger;

	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		this.generalLogger = loggerFactory.createLogger('yohira.server.node');
	}

	isEnabled(logLevel: LogLevel): boolean {
		return this.generalLogger.isEnabled(logLevel);
	}

	log(logLevel: LogLevel, message?: any, ...optionalParams: any[]): void {
		return this.generalLogger.log(logLevel, message, ...optionalParams);
	}

	applicationError(
		connectionId: string,
		traceIdentifier: string,
		error: Error,
	): void {
		applicationError(
			this.generalLogger,
			connectionId,
			traceIdentifier,
			error,
		);
	}
}
