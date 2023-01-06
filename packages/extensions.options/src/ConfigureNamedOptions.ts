import { IConfigureNamedOptions } from '@yohira/extensions.options/IConfigureNamedOptions';
import { Options } from '@yohira/extensions.options/Options';
// TODO: Remove.
import 'reflect-metadata';

// https://source.dot.net/#Microsoft.Extensions.Options/ConfigureNamedOptions.cs,ea88416116840787,references
export class ConfigureNamedOptions<TOptions>
	implements IConfigureNamedOptions<TOptions>
{
	constructor(
		readonly name: string | undefined,
		readonly action: ((options: TOptions) => void) | undefined,
	) {}

	configureNamed = (name: string | undefined, options: TOptions): void => {
		if (this.name === undefined || name === this.name) {
			this.action?.(options);
		}
	};

	configure = (options: TOptions): void => {
		return this.configureNamed(Options.defaultName, options);
	};
}
