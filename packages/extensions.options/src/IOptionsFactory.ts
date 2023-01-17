import { Ctor } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Options/IOptionsFactory.cs,d81000b5834f00ca,references
export interface IOptionsFactory<TOptions> {
	create(optionsCtor: Ctor<TOptions>, name: string): TOptions;
}
