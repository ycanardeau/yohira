import { IPAddress, IPEndPoint } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	FeatureCollection,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { ServerAddressesFeature } from '@yohira/hosting';
import {
	IHttpApp,
	IServer,
	IServerAddressesFeature,
} from '@yohira/hosting.server.abstractions';
import { createServer } from 'node:http';

import { HttpConnectionContext } from './HttpConnectionContext';
import { ServiceContext } from './ServiceContext';
import { Http1Connection } from './http/Http1Connection';
import { NodeTrace } from './infrastructure/NodeTrace';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/KestrelServerImpl.cs,6911f1692c68cbd5,references
export class NodeServerImpl implements IServer, AsyncDisposable {
	private readonly serverAddresses: ServerAddressesFeature;

	private hasStarted = false;

	readonly features: IFeatureCollection;
	private readonly serviceContext: ServiceContext;

	private static createServiceContext(
		loggerFactory: ILoggerFactory,
	): ServiceContext {
		const trace = new NodeTrace(loggerFactory);

		return ((): ServiceContext => {
			const serviceContext = new ServiceContext();
			serviceContext.log = trace;
			return serviceContext;
		})();
	}

	constructor(@inject(ILoggerFactory) loggerFactory: ILoggerFactory) {
		// TODO

		this.serviceContext =
			NodeServerImpl.createServiceContext(loggerFactory);

		this.features = new FeatureCollection();
		this.serverAddresses = new ServerAddressesFeature();
		this.features.set<IServerAddressesFeature>(
			IServerAddressesFeature,
			this.serverAddresses,
		);

		// TODO
	}

	async start<TContext>(app: IHttpApp<TContext>): Promise<void> {
		// TODO: validateOptions

		if (this.hasStarted) {
			// The server has already started and/or has not been cleaned up yet
			throw new Error('Server has already started.' /* LOC */);
		}
		this.hasStarted = true;

		// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
		const server = createServer(async (request, response) => {
			const httpConnectionContext = new Http1Connection(
				((): HttpConnectionContext => {
					const httpConnectionContext = new HttpConnectionContext(
						this.serviceContext,
						this.features,
						(request.socket.localFamily === 'IPv4' ||
							request.socket.localFamily === 'IPv6') &&
						request.socket.localAddress !== undefined &&
						request.socket.localPort !== undefined
							? new IPEndPoint(
									new IPAddress(
										request.socket.localFamily,
										request.socket.localAddress,
									),
									request.socket.localPort,
								)
							: undefined,
						(request.socket.remoteFamily === 'IPv4' ||
							request.socket.remoteFamily === 'IPv6') &&
						request.socket.remoteAddress !== undefined &&
						request.socket.remotePort !== undefined
							? new IPEndPoint(
									new IPAddress(
										request.socket.remoteFamily,
										request.socket.remoteAddress,
									),
									request.socket.remotePort,
								)
							: undefined,
					);
					httpConnectionContext.transport = {
						input: request,
						output: response,
					};
					return httpConnectionContext;
				})(),
			);
			await httpConnectionContext.processRequests(app);
		});
		server.listen(Number(process.env.PORT) || 5000 /* TODO */);
	}

	stop(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	async [Symbol.asyncDispose](): Promise<void> {
		// TODO
		//throw new Error('Method not implemented.');
	}
}
