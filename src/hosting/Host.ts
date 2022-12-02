import { IHost } from '@/hosting/IHost';
import { IHostedService } from '@/hosting/IHostedService';
import { ILogger, LogLevel, logDebug } from '@/logging/ILogger';
import { Container } from 'inversify';

// https://github.com/dotnet/runtime/blob/57bfe474518ab5b7cfe6bf7424a79ce3af9d6657/src/libraries/Microsoft.Extensions.Hosting/src/Internal/LoggerEventIds.cs#L8
enum LoggerEventId {
	Starting = 1,
	Started = 2,
	Stopping = 3,
	Stopped = 4,
	StoppedWithError = 5,
	ApplicationStartupError = 6,
	ApplicationStoppingError = 7,
	ApplicationStoppedError = 8,
	BackgroundServiceFaulted = 9,
	BackgroundServiceStoppingHost = 10,
}

// https://github.com/dotnet/runtime/blob/2d4f2d0c8f60d5f49e39f3ddbe1824648ee2b306/src/libraries/Microsoft.Extensions.Hosting/src/Internal/HostingLoggerExtensions.cs#L32
export const logStarting = (logger: ILogger): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, LoggerEventId.Starting, 'Hosting starting');
	}
};

// https://github.com/dotnet/runtime/blob/2d4f2d0c8f60d5f49e39f3ddbe1824648ee2b306/src/libraries/Microsoft.Extensions.Hosting/src/Internal/HostingLoggerExtensions.cs#L42
export const logStarted = (logger: ILogger): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, LoggerEventId.Started, 'Hosting started');
	}
};

// https://github.com/dotnet/runtime/blob/215b39abf947da7a40b0cb137eab4bceb24ad3e3/src/libraries/Microsoft.Extensions.Hosting/src/Internal/Host.cs#L16
export class Host implements IHost {
	private hostedServices?: IHostedService[];

	constructor(
		readonly services: Container,
		private readonly logger: ILogger,
	) {}

	// https://github.com/dotnet/runtime/blob/215b39abf947da7a40b0cb137eab4bceb24ad3e3/src/libraries/Microsoft.Extensions.Hosting/src/Internal/Host.cs#L56
	start = async (): Promise<void> => {
		logStarting(this.logger);

		// IMPL

		this.hostedServices = this.services.getAll('IHostedService');

		for (const hostedService of this.hostedServices) {
			await hostedService.start();
		}

		// IMPL

		logStarted(this.logger);
	};
}
