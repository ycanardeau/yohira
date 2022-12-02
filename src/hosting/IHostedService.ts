// https://github.com/dotnet/runtime/blob/bd7e1cb81d763589b95f7bfbaa2a96dd364e9103/src/libraries/Microsoft.Extensions.Hosting.Abstractions/src/IHostedService.cs#L12
export interface IHostedService {
	start(): Promise<void>;
	// TODO: stop(): Promise<void>;
}
