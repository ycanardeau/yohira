import { IOptions } from './IOptions';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsWrapper.cs,4c3a417da457cbe6,references
export class OptionsWrapper<TOptions> implements IOptions<TOptions> {
	constructor(private readonly value: TOptions) {}

	getValue(): TOptions {
		return this.value;
	}
}
