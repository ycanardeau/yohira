// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/Options.cs#L19
export const defaultName = '';

// https://github.com/dotnet/runtime/blob/09613f3ed6cb5ce62e955d2a1979115879d707bb/src/libraries/Microsoft.Extensions.Options/src/IOptions.cs#L12
export interface IOptions<TOptions> {
	readonly value: TOptions;
}
