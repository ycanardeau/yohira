import { ILogger, ILoggerFactory, LogLevel } from '@/logging/ILogger';
import { injectable } from 'inversify';

export class Logger implements ILogger {
	isEnabled = (logLevel: LogLevel): boolean => {
		return true; /* TODO */
	};
}

@injectable()
export class LoggerFactory implements ILoggerFactory {
	createLogger = (categoryName: string): ILogger => {
		return new Logger() /* TODO */;
	};
}
