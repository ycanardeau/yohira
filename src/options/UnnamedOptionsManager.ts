import { IOptions, defaultName } from '@/options/IOptions';
import { IOptionsFactory } from '@/options/IOptionsFactory';
import { TYPES } from '@/types';
import { inject, injectable } from 'inversify';

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.Options/src/UnnamedOptionsManager.cs#L9
@injectable()
export class UnnamedOptionsManager<TOptions> implements IOptions<TOptions> {
	private _value?: TOptions;

	constructor(
		@inject(TYPES.IOptionsFactory)
		private readonly factory: IOptionsFactory<TOptions>,
	) {}

	get value(): TOptions {
		if (this._value) {
			return this._value;
		}

		return (this._value ??= this.factory.create(defaultName));
	}
}
