import { Ctor } from '@yohira/base/Type';

// https://source.dot.net/#Microsoft.Extensions.Options/IOptionsMonitor.cs,0b0ae221bf3b6163,references
export interface IOptionsMonitor<TOptions> {
	getCurrentValue(optionsCtor: Ctor<TOptions>): TOptions;
	get(optionsCtor: Ctor<TOptions>, name: string | undefined): TOptions;
}
