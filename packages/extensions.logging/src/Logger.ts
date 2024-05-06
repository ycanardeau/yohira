import { ConsoleColor } from '@yohira/base';
import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

// TODO: move
function getLogLevelString(logLevel: LogLevel): string {
	switch (logLevel) {
		case LogLevel.Trace:
			return 'trce';
		case LogLevel.Debug:
			return 'dbug';
		case LogLevel.Information:
			return 'info';
		case LogLevel.Warning:
			return 'warn';
		case LogLevel.Error:
			return 'fail';
		case LogLevel.Critical:
			return 'crit';
		default:
			throw new Error(
				'Specified argument was out of the range of valid values.' /* LOC */,
			);
	}
}

// TODO: move
class ConsoleColors {
	constructor(
		readonly foreground: ConsoleColor | undefined,
		readonly background: ConsoleColor | undefined,
	) {}
}

// TODO: move
function getLogLevelConsoleColors(logLevel: LogLevel): ConsoleColors {
	const disableColors = false;
	if (disableColors) {
		return new ConsoleColors(undefined, undefined);
	}
	// We must explicitly set the background color if we are setting the foreground color,
	// since just setting one can look bad on the users console.
	switch (logLevel) {
		case LogLevel.Trace:
			return new ConsoleColors(ConsoleColor.Gray, ConsoleColor.Black);
		case LogLevel.Debug:
			return new ConsoleColors(ConsoleColor.Gray, ConsoleColor.Black);
		case LogLevel.Information:
			return new ConsoleColors(
				ConsoleColor.DarkGreen,
				ConsoleColor.Black,
			);
		case LogLevel.Warning:
			return new ConsoleColors(ConsoleColor.Yellow, ConsoleColor.Black);
		case LogLevel.Error:
			return new ConsoleColors(ConsoleColor.Black, ConsoleColor.DarkRed);
		case LogLevel.Critical:
			return new ConsoleColors(ConsoleColor.White, ConsoleColor.DarkRed);
		default:
			return new ConsoleColors(undefined, undefined);
	}
}

// TODO: move
const defaultForegroundColor = '\x1b[39m\x1b[22m'; // reset to default foreground color

// TODO: move
function getForegroundColorEscapeCode(color: ConsoleColor): string {
	switch (color) {
		case ConsoleColor.Black:
			return '\x1b[30m';
		case ConsoleColor.DarkRed:
			return '\x1b[31m';
		case ConsoleColor.DarkGreen:
			return '\x1b[32m';
		case ConsoleColor.DarkYellow:
			return '\x1b[33m';
		case ConsoleColor.DarkBlue:
			return '\x1b[34m';
		case ConsoleColor.DarkMagenta:
			return '\x1b[35m';
		case ConsoleColor.DarkCyan:
			return '\x1b[36m';
		case ConsoleColor.Gray:
			return '\x1b[37m';
		case ConsoleColor.Red:
			return '\x1b[1m\x1b[31m';
		case ConsoleColor.Green:
			return '\x1b[1m\x1b[32m';
		case ConsoleColor.Yellow:
			return '\x1b[1m\x1b[33m';
		case ConsoleColor.Blue:
			return '\x1b[1m\x1b[34m';
		case ConsoleColor.Magenta:
			return '\x1b[1m\x1b[35m';
		case ConsoleColor.Cyan:
			return '\x1b[1m\x1b[36m';
		case ConsoleColor.White:
			return '\x1b[1m\x1b[37m';
		default:
			return defaultForegroundColor; // default foreground color
	}
}

// TODO: move
const defaultBackgroundColor = '\x1b[49m'; // reset to the background color

// TODO: move
function getBackgroundColorEscapeCode(color: ConsoleColor): string {
	switch (color) {
		case ConsoleColor.Black:
			return '\x1b[40m';
		case ConsoleColor.DarkRed:
			return '\x1b[41m';
		case ConsoleColor.DarkGreen:
			return '\x1b[42m';
		case ConsoleColor.DarkYellow:
			return '\x1b[43m';
		case ConsoleColor.DarkBlue:
			return '\x1b[44m';
		case ConsoleColor.DarkMagenta:
			return '\x1b[45m';
		case ConsoleColor.DarkCyan:
			return '\x1b[46m';
		case ConsoleColor.Gray:
			return '\x1b[47m';
		default:
			return defaultBackgroundColor; // Use default background color
	}
}

// https://source.dot.net/#Microsoft.Extensions.Logging/Logger.cs,fdb90470ff3a62bd,references
export class Logger implements ILogger {
	constructor(private readonly categoryName: string) {}

	log(logLevel: LogLevel, message: string): void {
		const { foreground, background } = getLogLevelConsoleColors(logLevel);

		console.log(
			`${getForegroundColorEscapeCode(foreground ?? ConsoleColor.White)}${getBackgroundColorEscapeCode(background ?? ConsoleColor.Black)}${getLogLevelString(logLevel)}\x1b[0m: ${this.categoryName}\n${message
				.split('\n')
				.map((line) => `      ${line}`)
				.join('\n')}`,
		);
	}

	isEnabled(logLevel: LogLevel): boolean {
		return true /* TODO */;
	}
}
