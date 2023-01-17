import { Ctor, Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { IOptions } from './IOptions';
import { IOptionsFactory } from './IOptionsFactory';
import { Options } from './Options';

// https://source.dot.net/#Microsoft.Extensions.Options/UnnamedOptionsManager.cs,6f6a7794aed32ecc,references
export class UnnamedOptionsManager<TOptions> implements IOptions<TOptions> {
	private _value?: TOptions;

	constructor(
		@inject(Type.from('IOptionsFactory<>'))
		private readonly factory: IOptionsFactory<TOptions>,
	) {}

	getValue(optionsCtor: Ctor<TOptions>): TOptions {
		if (this._value !== undefined) {
			return this._value;
		}

		return (this._value ??= this.factory.create(
			optionsCtor,
			Options.defaultName,
		));
	}
}
