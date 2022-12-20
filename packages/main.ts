import { createWebAppBuilder } from '@yohira/core/default-builder/WebApp';
import { FeatureCollection } from '@yohira/features/FeatureCollection';
import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import { IWebHostEnv } from '@yohira/hosting.abstractions/IWebHostEnv';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { AppBuilderFactory } from '@yohira/hosting/builder/AppBuilderFactory';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { GenericWebHostService } from '@yohira/hosting/generic-host/GenericWebHostService';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { HttpContextFactory } from '@yohira/hosting/http/HttpContextFactory';
import { HostingEnv } from '@yohira/hosting/internal/HostingEnv';
import { initialize } from '@yohira/hosting/internal/HostingEnvironmentExtensions';
import {
	HttpLoggingMiddleware,
	useHttpLogging,
} from '@yohira/http-logging/HttpLoggingMiddleware';
import { HttpLoggingOptions } from '@yohira/http-logging/HttpLoggingOptions';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';
import { HttpContext } from '@yohira/http/HttpContext';
import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';
import { LoggerFactory } from '@yohira/logging/LoggerFactory';
import { IOptions } from '@yohira/options/IOptions';
import { IOptionsMonitor } from '@yohira/options/IOptionsMonitor';
import {
	StaticFileMiddleware,
	StaticFileOptions,
	useStaticFiles,
} from '@yohira/static-files/StaticFileMiddleware';
import { Container } from 'inversify';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

export const main = async (): Promise<void> => {
	const builder = createWebAppBuilder(/* TODO */);

	// TODO: Remove.
	{
		const container = builder.services;

		container
			.bind(IServer)
			.toDynamicValue((): IServer => {
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
								featureCollection.set(IncomingMessage, request);
								featureCollection.set(
									ServerResponse<IncomingMessage>,
									response,
								);
								featureCollection.set(Container, container);
								const context =
									app.createContext(featureCollection);

								await app.processRequest(context);
							},
						);
						server.listen(8000 /* TODO */);
					},
					stop: async (): Promise<void> => {},
					dispose: async (): Promise<void> => {},
				};
			})
			.inSingletonScope();

		container
			.bind(IAppBuilderFactory)
			.to(AppBuilderFactory)
			.inSingletonScope();
		container
			.bind(IHttpContextFactory)
			.to(HttpContextFactory)
			.inSingletonScope();

		container
			.bind(IOptions)
			.toDynamicValue((): IOptions<GenericWebHostServiceOptions> => {
				const options = new GenericWebHostServiceOptions();
				options.configureApp = (app): void => {
					// TODO
				};
				return { value: options };
			})
			.inSingletonScope()
			.whenTargetNamed(GenericWebHostServiceOptions.name);
		container
			.bind(IHostedService)
			.to(GenericWebHostService)
			.inSingletonScope();

		const hostingEnv = new HostingEnv();
		initialize(hostingEnv, '' /* TODO */, {} /* TODO */);
		container
			.bind(IWebHostEnv)
			.toDynamicValue(() => hostingEnv)
			.inSingletonScope();

		container
			.bind(IOptions)
			.toDynamicValue((): IOptions<StaticFileOptions> => {
				const options = new StaticFileOptions();
				return { value: options };
			})
			.inSingletonScope()
			.whenTargetNamed(StaticFileOptions.name);

		container
			.bind(IOptionsMonitor)
			.toDynamicValue((): IOptionsMonitor<HttpLoggingOptions> => {
				const options = new HttpLoggingOptions();
				return { currentValue: options };
			})
			.inSingletonScope()
			.whenTargetNamed(HttpLoggingOptions.name);

		container.bind(ILoggerFactory).to(LoggerFactory).inSingletonScope();

		container.bind(StaticFileMiddleware).toSelf().inSingletonScope();

		container.bind(HttpLoggingMiddleware).toSelf().inSingletonScope();
	}

	// TODO

	const app = builder.build();

	useStaticFiles(app);

	useHttpLogging(app);

	use(app, async (context, next) => {
		if (!(context instanceof HttpContext)) {
			throw new Error('context must be of type HttpContext');
		}

		const { nativeResponse } = context;
		nativeResponse.writeHead(200, { 'Content-Type': 'application/json' });
		nativeResponse.end(
			JSON.stringify({
				data: 'Hello, World!',
			}),
		);

		await next(context);
	});

	await app.run();
};