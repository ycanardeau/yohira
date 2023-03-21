import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,7deeeff757740dc2,references
function isLogLevelEnabledCore(
	logger: ILogger | undefined,
	level: LogLevel,
): boolean {
	return logger !== undefined && logger.isEnabled(level);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,347cf1ec45d280e4,references
export function isDebugLevelEnabled(logger: ILogger | undefined): boolean {
	return isLogLevelEnabledCore(logger, LogLevel.Debug);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,017ac1071ea41df9,references
export function isTraceLevelEnabled(logger: ILogger | undefined): boolean {
	return isLogLevelEnabledCore(logger, LogLevel.Trace);
}
