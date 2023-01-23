import { tryGetValue } from '@yohira/base';
import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';

import { Logger } from './Logger';

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

	dispose(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
