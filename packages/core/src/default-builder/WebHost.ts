import { HostFilteringStartupFilter } from '@yohira/core/default-builder/HostFilteringStartupFilter';
import {
	addSingletonFactory,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { ServiceProvider } from '@yohira/extensions.dependency-injection/ServiceProvider';
import { FeatureCollection } from '@yohira/extensions.features/FeatureCollection';
import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore/WebHost.cs,ca2002fa0bfdb774,references
export const configureWebDefaults = (builder: IWebHostBuilder): void => {
	// TODO
	builder
		.configureServices(
			/* TODO */ (/* TODO */ services) => {
				addSingletonFactory(
					services,
					'IServer',
					(serviceProvider): IServer => {
						return {
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
											ServiceProvider,
											serviceProvider,
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
						};
					},
				);
			},
		)
		.configureServices((/* TODO */ services) => {
			// TODO

			addTransientCtor(
				services,
				'IStartupFilter',
				HostFilteringStartupFilter,
			);
			// TODO

			// TODO
		});
};
