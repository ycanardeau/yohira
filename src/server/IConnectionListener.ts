import { BaseConnectionContext } from '@/connections/BaseConnectionContext';

export interface IConnectionListenerBase /* TODO: extends IAsyncDisposable */ {}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Infrastructure/IConnectionListenerOfT.cs#L12
export interface IConnectionListener<T extends BaseConnectionContext>
	extends IConnectionListenerBase {
	accept(): Promise<T | undefined>;
}
