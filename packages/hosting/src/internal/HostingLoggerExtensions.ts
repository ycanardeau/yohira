import { Host } from '@yohira/hosting/internal/Host';
import { ILogger } from '@yohira/logging.abstractions/ILogger';
import { LogLevel } from '@yohira/logging.abstractions/LogLevel';
import { logDebug } from '@yohira/logging.abstractions/LoggerExtensions';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,540da2ba575f0fbd,references
export const logStarting = (logger: ILogger<Host>): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting starting');
	}
};

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,a011de95abb2f38f,references
export const logStarted = (logger: ILogger<Host>): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting started');
	}
};

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,4b2300f46fd7421e,references
export const logStopping = (logger: ILogger<Host>): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting stopping');
	}
};

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,85f1133a236df392,references
export const logStopped = (logger: ILogger<Host>): void => {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting stopped');
	}
};
