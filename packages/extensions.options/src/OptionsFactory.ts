import { Ctor } from '@yohira/base/Type';
import { IConfigureNamedOptions } from '@yohira/extensions.options/IConfigureNamedOptions';
import { IConfigureOptions } from '@yohira/extensions.options/IConfigureOptions';
import { IOptionsFactory } from '@yohira/extensions.options/IOptionsFactory';
import { Options } from '@yohira/extensions.options/Options';
import { inject } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsFactory.cs,89202ae8d1498a3f,references
export class OptionsFactory<TOptions> implements IOptionsFactory<TOptions> {
	constructor(
		@inject(
			'Iterable<IConfigureOptions<FakeOptions>>' /* TODO: Remove FakeOptions */,
		)
		private readonly setups: (
			| IConfigureOptions<TOptions>
			| IConfigureNamedOptions<TOptions>
		)[],
	) {}

	protected createInstance = (
		optionsCtor: Ctor<TOptions>,
		name: string,
	): TOptions => {
		return new optionsCtor();
	};

	create = (optionsCtor: Ctor<TOptions>, name: string): TOptions => {
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
	};
}
