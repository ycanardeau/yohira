import { HostFilteringStartupFilter } from '@yohira/core/default-builder/HostFilteringStartupFilter';
import { FeatureCollection } from '@yohira/features/FeatureCollection';
import { IStartupFilter } from '@yohira/hosting.abstractions/IStartupFilter';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { Container } from 'inversify';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore/WebHost.cs,ca2002fa0bfdb774,references
export const configureWebDefaults = (builder: IWebHostBuilder): void => {
	// TODO
	builder
		.configureServices(
			/* TODO */ (/* TODO */ services) => {
				services
					.bind(IServer)
					.toDynamicValue(
						(): IServer => ({
							start: async (app): Promise<void> => {
								// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
								const server = createServer(
									async (
										request: IncomingMessage,
										response: ServerResponse<IncomingMessage>,
									): Promise<void> => {
										const featureCollection =
											new FeatureCollection();
										featureCollection.set(
											IncomingMessage,
											request,
										);
										featureCollection.set(
											ServerResponse<IncomingMessage>,
											response,
										);
										featureCollection.set(
											Container,
											services,
										);
										const context =
											app.createContext(
												featureCollection,
											);

										await app.processRequest(context);
									},
								);
								server.listen(8000 /* TODO */);
							},
							stop: async (): Promise<void> => {
								// TODO
								throw new Error('Method not implemented.');
							},
							dispose: async (): Promise<void> => {
								// TODO
								throw new Error('Method not implemented.');
							},
						}),
					)
					.inSingletonScope();
			},
		)
		.configureServices((/* TODO */ services) => {
			// TODO

			// TODO: Use IServiceCollection.
			services
				.bind(IStartupFilter)
				.to(HostFilteringStartupFilter)
				.inTransientScope();

			// TODO
		});
};
