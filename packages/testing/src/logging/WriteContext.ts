import { LogLevel } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.InternalTesting/Logging/WriteContext.cs,e6fdd639d40b4da4,references
export class WriteContext {
	logLevel = LogLevel.Trace;
	state!: object;
	loggerName!: string;
}
