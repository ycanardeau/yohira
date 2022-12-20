// https://source.dot.net/#Microsoft.Extensions.Options/IConfigureOptions.cs,cc5c3a6789e1e13f,references
export const IConfigureOptions = Symbol.for('IConfigureOptions');
export interface IConfigureOptions<TOptions> {
	configure(options: TOptions): void;
}
