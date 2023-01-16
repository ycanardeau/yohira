import { NamedConfigureFromConfigOptions } from '@/NamedConfigureFromConfigOptions';
import { Ctor, Type } from '@yohira/base';
import { IConfig } from '@yohira/extensions.config.abstractions';
import {
	IServiceCollection,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions';
import { Options, addOptions } from '@yohira/extensions.options';

// https://source.dot.net/#Microsoft.Extensions.Options.ConfigurationExtensions/OptionsConfigurationServiceCollectionExtensions.cs,2aa74bb06c82c8f7,references
export function configureOptionsConfigServices<TOptions extends object>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	config: IConfig,
): IServiceCollection {
	addOptions(services);
	// TODO
	return addSingletonInstance(
		services,
		Type.from(`IConfigureOptions<${optionsCtor.name}>`),
		new NamedConfigureFromConfigOptions<TOptions>(
			Options.defaultName,
			config,
			() => {},
		),
	);
}
