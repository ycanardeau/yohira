import { ConfigureNamedOptions } from '@yohira/options/ConfigureNamedOptions';
import { IConfigureOptions } from '@yohira/options/IConfigureOptions';
import { Options } from '@yohira/options/Options';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
const configureNamedOptionsServices = <TOptions>(
	services: Container,
	optionsType: new (...args: never[]) => TOptions,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): Container => {
	// TODO: addOptions
	services
		.bind(IConfigureOptions)
		.toDynamicValue(
			() => new ConfigureNamedOptions<TOptions>(name, configureOptions),
		)
		.inSingletonScope()
		.whenTargetNamed(optionsType.name);
	return services;
};

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,b5db69a84107f087,references
export const configureOptionsServices = <TOptions>(
	services: Container,
	optionsType: new (...args: never[]) => TOptions,
	configureOptions: (options: TOptions) => void,
): Container => {
	return configureNamedOptionsServices(
		services,
		optionsType,
		Options.defaultName,
		configureOptions,
	);
};
