export const ILogger = Symbol.for('ILogger');
export interface ILogger {
	debug(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
}
