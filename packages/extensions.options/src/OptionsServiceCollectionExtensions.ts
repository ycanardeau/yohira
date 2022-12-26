import { Ctor } from '@yohira/base/Type';
import { ConfigureNamedOptions } from '@yohira/extensions.options/ConfigureNamedOptions';
import { IConfigureOptions } from '@yohira/extensions.options/IConfigureOptions';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { Options } from '@yohira/extensions.options/Options';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { Container } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Options/OptionsServiceCollectionExtensions.cs,a6eee6a022a93bdc,references
const configureNamedOptionsServices = <TOptions>(
	services: Container,
	optionsType: Ctor<TOptions>,
	name: string | undefined,
	configureOptions: (options: TOptions) => void,
): Container => {
	// TODO: Remove.
	services
		.bind(IOptions)
		.toDynamicValue((): IOptions<GenericWebHostServiceOptions> => {
			const options = new GenericWebHostServiceOptions();
			configureOptions(options as TOptions);
			return { value: options };
		})
		.inSingletonScope()
		.whenTargetNamed(GenericWebHostServiceOptions.name);

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
	optionsType: Ctor<TOptions>,
	configureOptions: (options: TOptions) => void,
): Container => {
	return configureNamedOptionsServices(
		services,
		optionsType,
		Options.defaultName,
		configureOptions,
	);
};
