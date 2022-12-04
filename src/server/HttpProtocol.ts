import { IHttpApp } from '@/hosting/IServer';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Http/HttpProtocol.cs#L26
export abstract class HttpProtocol {
	protected keepAlive = true;

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Http/HttpProtocol.cs#L623
	private _processRequests = async <TContext>(
		app: IHttpApp<TContext>,
	): Promise<void> => {
		while (this.keepAlive) {
			// IMPL
		}
	};

	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Internal/Http/HttpProtocol.cs#L569
	processRequests = async <TContext>(
		app: IHttpApp<TContext>,
	): Promise<void> => {
		// TODO: Try.
		await this._processRequests(app);
		// TODO: Catch.
	};
}
