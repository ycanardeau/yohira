import { IOptionsMonitor } from '@yohira/extensions.options/IOptionsMonitor';
import { Options } from '@yohira/extensions.options/Options';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsMonitor.cs,0e2f503af67e26a9,references
export class OptionsMonitor<TOptions> implements IOptionsMonitor<TOptions> {
	get = (name: string | undefined): TOptions => {
		// TODO
		throw new Error('Method not implemented.');
	};

	get currentValue(): TOptions {
		return this.get(Options.defaultName);
	}
}
