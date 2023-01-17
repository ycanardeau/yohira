import {
	ILoggerT,
	LogLevel,
	logDebug,
} from '@yohira/extensions.logging.abstractions';

import { Host } from '../internal/Host';

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,540da2ba575f0fbd,references
export function logStarting(logger: ILoggerT<Host>): void {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting starting');
	}
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,a011de95abb2f38f,references
export function logStarted(logger: ILoggerT<Host>): void {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting started');
	}
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,4b2300f46fd7421e,references
export function logStopping(logger: ILoggerT<Host>): void {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting stopping');
	}
}

// https://source.dot.net/#Microsoft.Extensions.Hosting/Internal/HostingLoggerExtensions.cs,85f1133a236df392,references
export function logStopped(logger: ILoggerT<Host>): void {
	if (logger.isEnabled(LogLevel.Debug)) {
		logDebug(logger, 'Hosting stopped');
	}
}
