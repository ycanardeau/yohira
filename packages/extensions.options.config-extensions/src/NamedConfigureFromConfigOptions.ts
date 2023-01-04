import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { BinderOptions } from '@yohira/extensions.config.binder/BinderOptions';
import { bind } from '@yohira/extensions.config.binder/ConfigBinder';
import { ConfigureNamedOptions } from '@yohira/extensions.options/ConfigureNamedOptions';

// https://source.dot.net/#Microsoft.Extensions.Options.ConfigurationExtensions/NamedConfigureFromConfigurationOptions.cs,e21b145e221284a9,references
export class NamedConfigureFromConfigOptions<
	TOptions extends object,
> extends ConfigureNamedOptions<TOptions> {
	constructor(
		name: string | undefined,
		config: IConfig,
		configureBinder: (options: BinderOptions) => void,
	) {
		super(name, (options) => bind(config, options, configureBinder));
	}
}
