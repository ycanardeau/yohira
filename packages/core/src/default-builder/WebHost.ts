import { Type } from '@yohira/base';
import {
	addSingletonFactory,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import { FeatureCollection } from '@yohira/extensions.features';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IServer } from '@yohira/hosting.server.abstractions';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

import { HostFilteringStartupFilter } from './HostFilteringStartupFilter';

// https://source.dot.net/#Microsoft.AspNetCore/WebHost.cs,ca2002fa0bfdb774,references
export function configureWebDefaults(builder: IWebHostBuilder): void {
	// TODO
	builder
		.configureServices(
			/* TODO */ (/* TODO */ services) => {
				addSingletonFactory(
					services,
					Type.from('IServer'),
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
											Type.from('IncomingMessage'),
											request,
										);
										featureCollection.set(
											Type.from(
												'ServerResponse<IncomingMessage>',
											),
											response,
										);
										featureCollection.set(
											Type.from('ServiceProvider'),
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
				Type.from('IStartupFilter'),
				HostFilteringStartupFilter,
			);
			// TODO

			// TODO
		});
}
