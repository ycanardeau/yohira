import { IConnectionBuilder } from '@/connections/IConnectionBuilder';
import { HttpConnection } from '@/server/HttpConnection';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Middleware/HttpConnectionMiddleware.cs#L12
export class HttpConnectionMiddleware<TContext> {
	// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Middleware/HttpConnectionMiddleware.cs#L27
	onConnection = (/* TODO */): Promise<void> => {
		const connection = new HttpConnection(/* TODO */);
		return connection.processRequests(/* TODO */);
	};
}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Servers/Kestrel/Core/src/Middleware/HttpConnectionBuilderExtensions.cs#L11
export const useHttpServer = <TContext>(
	builder: IConnectionBuilder,
	/* TODO */
): IConnectionBuilder => {
	const middleware = new HttpConnectionMiddleware<TContext>(/* TODO */);
	return builder.use(() => {
		return middleware.onConnection;
	});
};
