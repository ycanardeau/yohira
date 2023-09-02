import { Ctor } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

import { IConfigureNamedOptions } from './IConfigureNamedOptions';
import { IConfigureOptions } from './IConfigureOptions';
import { IOptionsFactory } from './IOptionsFactory';
import { IPostConfigureOptions } from './IPostConfigureOptions';
import { Options } from './Options';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsFactory.cs,89202ae8d1498a3f,references
export class OptionsFactory<TOptions> implements IOptionsFactory<TOptions> {
	constructor(
		@inject(Symbol.for('Iterable<IConfigureOptions<>>'))
		private readonly setups: Iterable<IConfigureOptions<TOptions>>,
		@inject(Symbol.for('Iterable<IPostConfigureOptions<>>'))
		private readonly postConfigures: Iterable<
			IPostConfigureOptions<TOptions>
		>,
	) {}

	protected createInstance(
		optionsCtor: Ctor<TOptions>,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_name: string,
	): TOptions {
		return new optionsCtor();
	}

	private static isIConfigureNamedOptions<TOptions>(
		setup: IConfigureOptions<TOptions> | IConfigureNamedOptions<TOptions>,
	): setup is IConfigureNamedOptions<TOptions> {
		return 'configureNamed' in setup;
	}

	create(optionsCtor: Ctor<TOptions>, name: string): TOptions {
		const options = this.createInstance(optionsCtor, name);
		for (const setup of this.setups) {
			if (OptionsFactory.isIConfigureNamedOptions(setup)) {
				setup.configureNamed(name, options);
			} else if (name === Options.defaultName) {
				setup.configure(options);
			}
		}
		for (const post of this.postConfigures) {
			post.postConfigure(name, options);
		}
		// TODO
		return options;
	}
}
