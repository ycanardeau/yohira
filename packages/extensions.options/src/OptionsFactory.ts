import { Ctor, Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { IConfigureNamedOptions } from './IConfigureNamedOptions';
import { IConfigureOptions } from './IConfigureOptions';
import { IOptionsFactory } from './IOptionsFactory';
import { Options } from './Options';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsFactory.cs,89202ae8d1498a3f,references
export class OptionsFactory<TOptions> implements IOptionsFactory<TOptions> {
	constructor(
		@inject(Type.from('Iterable<IConfigureOptions<>>'))
		private readonly setups: (
			| IConfigureOptions<TOptions>
			| IConfigureNamedOptions<TOptions>
		)[],
	) {}

	protected createInstance(
		optionsCtor: Ctor<TOptions>,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_name: string,
	): TOptions {
		return new optionsCtor();
	}

	create(optionsCtor: Ctor<TOptions>, name: string): TOptions {
		const options = this.createInstance(optionsCtor, name);
		for (const setup of this.setups) {
			if ('configureNamed' in setup) {
				setup.configureNamed(name, options);
			} else if (name === Options.defaultName) {
				setup.configure(options);
			}
		}
		// TODO
		return options;
	}
}
