import { Ctor, Type } from '@yohira/base/Type';
import { inject } from '@yohira/extensions.dependency-injection.abstractions/inject';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { IOptionsFactory } from '@yohira/extensions.options/IOptionsFactory';
import { Options } from '@yohira/extensions.options/Options';

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
