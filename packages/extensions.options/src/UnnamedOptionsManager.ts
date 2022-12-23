import { IOptions } from '@yohira/extensions.options/IOptions';
import { IOptionsFactory } from '@yohira/extensions.options/IOptionsFactory';
import { Options } from '@yohira/extensions.options/Options';
import { inject } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Options/UnnamedOptionsManager.cs,6f6a7794aed32ecc,references
export class UnnamedOptionsManager<TOptions> implements IOptions<TOptions> {
	private _value?: TOptions;

	constructor(
		@inject('IOptionsFactory<FakeOptions>' /* TODO: Remove FakeOptions. */)
		private readonly factory: IOptionsFactory<TOptions>,
	) {}

	get value(): TOptions {
		if (this._value !== undefined) {
			return this._value;
		}

		return (this._value ??= this.factory.create(Options.defaultName));
	}
}
