import { IOptionsFactory } from '@/options/IOptionsFactory';
import { injectable } from 'inversify';

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.Options/src/OptionsFactory.cs#L14
@injectable()
export class OptionsFactory<TOptions> implements IOptionsFactory<TOptions> {
	create = (
		TOptions: new (...args: never[]) => TOptions,
		name: string,
	): TOptions => {
		const options = new TOptions();
		// TODO
		return options;
	};
}
