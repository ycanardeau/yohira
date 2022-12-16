// https://source.dot.net/#Microsoft.Extensions.Options/IOptions.cs,63b7cb270afa5bd8
export const IOptions = Symbol.for('IOptions');
export interface IOptions<TOptions> {
	value: TOptions;
}
