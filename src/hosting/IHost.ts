// https://github.com/dotnet/runtime/blob/74dc242fb93d4e500e9f0561fb49258adc9142d6/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/IHost.cs#L13
export interface IHost {
	start(): Promise<void>;
	// TODO: stop(): Promise<void>;
}

// https://github.com/dotnet/runtime/blob/74dc242fb93d4e500e9f0561fb49258adc9142d6/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/HostingAbstractionsHostExtensions.cs#L60
export const runHost = async (host: IHost): Promise<void> => {
	await host.start();
};
