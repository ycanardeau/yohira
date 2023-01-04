import { Ctor, Type } from '@yohira/base/Type';
import { IConfig } from '@yohira/extensions.config.abstractions/IConfig';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { addSingletonInstance } from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { NamedConfigureFromConfigOptions } from '@yohira/extensions.options.config-extensions/NamedConfigureFromConfigOptions';
import { Options } from '@yohira/extensions.options/Options';
import { addOptions } from '@yohira/extensions.options/OptionsServiceCollectionExtensions';

// https://source.dot.net/#Microsoft.Extensions.Options.ConfigurationExtensions/OptionsConfigurationServiceCollectionExtensions.cs,2aa74bb06c82c8f7,references
export const configureOptionsConfigServices = <TOptions extends object>(
	services: IServiceCollection,
	optionsCtor: Ctor<TOptions>,
	config: IConfig,
): IServiceCollection => {
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
};
