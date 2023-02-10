import { IAsyncDisposable } from '@yohira/base';
import { IHttpApp, IServer } from '@yohira/hosting.server.abstractions';
import { Http1Connection } from '@yohira/server.node.core';
import { createServer } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/KestrelServerImpl.cs,6911f1692c68cbd5,references
export class NodeServerImpl implements IServer, IAsyncDisposable {
	private hasStarted = false;

	async start<TContext>(app: IHttpApp<TContext>): Promise<void> {
		// TODO: validateOptions

		if (this.hasStarted) {
			// The server has already started and/or has not been cleaned up yet
			throw new Error('Server has already started.' /* LOC */);
		}
		this.hasStarted = true;

		// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
		const server = createServer(async (request, response) => {
			const connection = new Http1Connection(request, response);
			await connection.processRequests(app);
		});
		server.listen(8000 /* TODO */);
	}

	stop(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	async disposeAsync(): Promise<void> {
		// TODO
		//throw new Error('Method not implemented.');
	}
}
