import { Type } from '@yohira/base';
import { FeatureCollection } from '@yohira/extensions.features';
import { IHttpApp, IServer } from '@yohira/hosting.server.abstractions';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/KestrelServerImpl.cs,6911f1692c68cbd5,references
export class NodeServerImpl implements IServer {
	async start<TContext>(app: IHttpApp<TContext>): Promise<void> {
		// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
		const server = createServer(
			async (
				request: IncomingMessage,
				response: ServerResponse<IncomingMessage>,
			): Promise<void> => {
				const featureCollection = new FeatureCollection();
				featureCollection.set(Type.from('IncomingMessage'), request);
				featureCollection.set(
					Type.from('ServerResponse<IncomingMessage>'),
					response,
				);
				const context = app.createContext(featureCollection);

				await app.processRequest(context);
			},
		);
		server.listen(8000 /* TODO */);
	}

	stop(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
