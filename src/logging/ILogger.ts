export const ILogger = Symbol.for('ILogger');
export interface ILogger {
	debug(message?: string, ...optionalParams: any[]): void;
	warn(message?: string, ...optionalParams: any[]): void;
}
