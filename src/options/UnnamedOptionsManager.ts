import { IOptions } from '@/options/IOptions';
import { injectable } from 'inversify';

// https://github.com/dotnet/runtime/blob/b77aa8a9726503df52327a0388a3f4a0325989e1/src/libraries/Microsoft.Extensions.Options/src/UnnamedOptionsManager.cs#L9
@injectable()
export class UnnamedOptionsManager<TOptions> implements IOptions<TOptions> {
	get value(): TOptions {
		return undefined!;
	}
}
