import { IConfigureOptions } from '@yohira/extensions.options/IConfigureOptions';

// https://source.dot.net/#Microsoft.Extensions.Options/IConfigureNamedOptions.cs,dcbbe171f1935c24,references
export interface IConfigureNamedOptions<TOptions>
	extends IConfigureOptions<TOptions> {
	configureNamed(name: string | undefined, options: TOptions): void;
}
