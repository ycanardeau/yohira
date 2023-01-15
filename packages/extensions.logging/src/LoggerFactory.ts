import { tryGetValue } from '@yohira/base/MapExtensions';
import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions/ILoggerFactory';
import { Logger } from '@yohira/extensions.logging/Logger';

// https://source.dot.net/#Microsoft.Extensions.Logging/LoggerFactory.cs,173b9b523cabe719,references
export class LoggerFactory implements ILoggerFactory {
	private readonly loggers = new Map<string, Logger>();

	createLogger(categoryName: string): ILogger {
		// TODO

		// REVIEW: Lock.
		const tryGetValueResult = tryGetValue(this.loggers, categoryName);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}
		const logger = new Logger(/* TODO */);
		// TODO
		this.loggers.set(categoryName, logger);
		return logger;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
