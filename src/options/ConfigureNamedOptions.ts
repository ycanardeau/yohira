// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/IConfigureNamedOptions.cs#L10
export interface IConfigureNamedOptions<TOptions> {
	configure(name: string | undefined, options: TOptions): void;
}

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/ConfigureNamedOptions.cs#L12
export class ConfigureNamedOptions<TOptions>
	implements IConfigureNamedOptions<TOptions>
{
	constructor(
		readonly TOptions: new (...args: never[]) => TOptions,
		readonly name: string | undefined,
		readonly action: ((options: TOptions) => void) | undefined,
	) {}

	configure = (name: string | undefined, options: TOptions): void => {};
}
