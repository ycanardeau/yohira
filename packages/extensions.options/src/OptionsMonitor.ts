import { IOptionsFactory } from '@/IOptionsFactory';
import { IOptionsMonitor } from '@/IOptionsMonitor';
import { IOptionsMonitorCache } from '@/IOptionsMonitorCache';
import { Options } from '@/Options';
import { OptionsCache } from '@/OptionsCache';
import { Ctor, Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsMonitor.cs,0e2f503af67e26a9,references
export class OptionsMonitor<TOptions> implements IOptionsMonitor<TOptions> {
	constructor(
		@inject(Type.from('IOptionsFactory<>'))
		private readonly factory: IOptionsFactory<TOptions>,
		@inject(Type.from('IOptionsMonitorCache<>'))
		private readonly cache: IOptionsMonitorCache<TOptions>,
	) {}

	get(optionsCtor: Ctor<TOptions>, name: string | undefined): TOptions {
		if (!(this.cache instanceof OptionsCache)) {
			// TODO
			throw new Error('Method not implemented.');
		}

		return this.cache.getOrAddWithArgument(
			name,
			(name) => this.factory.create(optionsCtor, name),
			this.factory,
		);
	}

	getCurrentValue(optionsCtor: Ctor<TOptions>): TOptions {
		return this.get(optionsCtor, Options.defaultName);
	}
}
