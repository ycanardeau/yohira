import { ILogger } from './ILogger';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Logging.Abstractions/src/NullLogger.cs#L11
export class NullLogger implements ILogger {
	static readonly instance = new NullLogger();

	isEnabled(): boolean {
		return false;
	}

	log(): void {}
}
