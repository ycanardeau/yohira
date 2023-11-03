import { ILogger } from './ILogger';
import { ILoggerFactory } from './ILoggerFactory';
import { NullLogger } from './NullLogger';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Logging.Abstractions/src/NullLoggerFactory.cs#L10
export class NullLoggerFactory implements ILoggerFactory {
	static readonly instance = new NullLoggerFactory();

	createLogger(): ILogger {
		return NullLogger.instance;
	}

	addProvider(): void {}

	[Symbol.dispose](): void {}
}
