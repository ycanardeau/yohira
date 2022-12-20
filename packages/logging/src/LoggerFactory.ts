import { ILogger } from '@yohira/logging.abstractions/ILogger';
import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';
import { LogLevel } from '@yohira/logging.abstractions/LogLevel';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Logging/LoggerFactory.cs,173b9b523cabe719,references
@injectable()
export class LoggerFactory implements ILoggerFactory {
	createLogger = <T>(
		categoryName: new (...args: never[]) => T,
	): ILogger<T> => {
		return {
			log: (logLevel, message, ...optionalParams): void => {
				switch (logLevel) {
					case LogLevel.Trace:
						console.trace(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.Debug:
						console.debug(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.Information:
						console.info(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.Warning:
						console.warn(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.Error:
						console.error(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.Critical:
						console.error(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;

					case LogLevel.None:
						console.log(
							categoryName.name,
							message,
							...optionalParams,
						);
						break;
				}
			},
			isEnabled: (): boolean => true,
		}; /* TODO */
	};

	dispose = (): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
