import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

import { ITestSink } from './ITestSink';
import { WriteContext } from './WriteContext';

// https://source.dot.net/#Microsoft.AspNetCore.InternalTesting/Logging/TestLogger.cs,23820653ba16d516,references
export class TestLogger implements ILogger {
	private readonly filter: (logLevel: LogLevel) => boolean;

	constructor(name: string, sink: ITestSink, enabled: boolean);
	constructor(
		name: string,
		sink: ITestSink,
		filter: (logLevel: LogLevel) => boolean,
	);
	constructor(
		private readonly name: string,
		private readonly sink: ITestSink,
		filterOrEnabled: ((logLevel: LogLevel) => boolean) | boolean,
	) {
		this.filter =
			typeof filterOrEnabled === 'boolean'
				? (): boolean => filterOrEnabled
				: filterOrEnabled;
	}

	isEnabled(logLevel: LogLevel): boolean {
		return logLevel !== LogLevel.None && this.filter(logLevel);
	}

	log(logLevel: LogLevel, message?: any, ...optionalParams: any[]): void {
		if (!this.isEnabled(logLevel)) {
			return;
		}

		this.sink.write(
			((): WriteContext => {
				const context = new WriteContext();
				context.logLevel = logLevel;
				// TODO: context.eventId = eventId;
				// TODO: context.state = state;
				// TODO: context.error = error
				// TODO: context.formatter = (s, e) => formatter(s, e);
				context.loggerName = this.name;
				// TODO: context.scope = this.scope;
				return context;
			})(),
		);
	}
}
