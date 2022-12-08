export interface ILogger<TCategoryName> {
	debug(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
}
