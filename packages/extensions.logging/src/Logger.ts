import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Logging/Logger.cs,fdb90470ff3a62bd,references
export class Logger implements ILogger {
	log(logLevel: LogLevel, message?: any, ...optionalParams: any[]): void {
		switch (logLevel) {
			case LogLevel.Trace:
				console.trace(message, ...optionalParams);
				break;
			case LogLevel.Debug:
				console.debug(message, ...optionalParams);
				break;
			case LogLevel.Information:
				console.info(message, ...optionalParams);
				break;
			case LogLevel.Warning:
				console.warn(message, ...optionalParams);
				break;
			case LogLevel.Error:
				console.error(message, ...optionalParams);
				break;
			case LogLevel.Critical:
				console.error(message, ...optionalParams);
				break;
			case LogLevel.None:
				console.log(message, ...optionalParams);
				break;
		}
	}

	isEnabled(logLevel: LogLevel): boolean {
		return true /* TODO */;
	}
}
