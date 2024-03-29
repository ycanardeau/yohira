import { Ctor } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Options/IOptions.cs,63b7cb270afa5bd8
export interface IOptions<TOptions> {
	getValue(optionsCtor: Ctor<TOptions>): TOptions;
}
