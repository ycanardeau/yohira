// https://source.dot.net/#Microsoft.Extensions.Options/IOptionsMonitor.cs,0b0ae221bf3b6163,references
export const IOptionsMonitor = Symbol.for('IOptionsMonitor');
export interface IOptionsMonitor<TOptions> {
	currentValue: TOptions;
}
