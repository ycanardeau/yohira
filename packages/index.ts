import { createWebAppBuilder } from '@yohira/core/default-builder/WebApp';
import { IHostedService } from '@yohira/hosting.abstractions/IHostedService';
import { IWebHostEnv } from '@yohira/hosting.abstractions/IWebHostEnv';
import { IServer } from '@yohira/hosting.server.abstractions/IServer';
import { AppBuilderFactory } from '@yohira/hosting/builder/AppBuilderFactory';
import { IAppBuilderFactory } from '@yohira/hosting/builder/IAppBuilderFactory';
import { GenericWebHostService } from '@yohira/hosting/generic-host/GenericWebHostService';
import { HostingEnv } from '@yohira/hosting/internal/HostingEnv';
import { initialize } from '@yohira/hosting/internal/HostingEnvironmentExtensions';
import {
	HttpLoggingMiddleware,
	useHttpLogging,
} from '@yohira/http-logging/HttpLoggingMiddleware';
import { HttpLoggingOptions } from '@yohira/http-logging/HttpLoggingOptions';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';
import { container } from '@yohira/http.abstractions/inversify.config';
import { HttpContext } from '@yohira/http/HttpContext';
import { ILogger } from '@yohira/logging.abstractions/ILogger';
import { ILoggerFactory } from '@yohira/logging.abstractions/ILoggerFactory';
import { LogLevel } from '@yohira/logging.abstractions/LogLevel';
import { IOptions } from '@yohira/options/IOptions';
import { IOptionsMonitor } from '@yohira/options/IOptionsMonitor';
import {
	StaticFileMiddleware,
	StaticFileOptions,
	useStaticFiles,
} from '@yohira/static-files/StaticFileMiddleware';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';

// TODO
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
						const context = app.createContext();

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

container.bind(IAppBuilderFactory).to(AppBuilderFactory).inSingletonScope();
container.bind(IHostedService).to(GenericWebHostService).inSingletonScope();

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

container
	.bind(ILoggerFactory)
	.toDynamicValue(
		(): ILoggerFactory => ({
			createLogger: <T>(
				categoryName: new (...args: never[]) => T,
			): ILogger<T> => ({
				log: (logLevel, message, ...optionalParams): void => {
					switch (logLevel) {
						case LogLevel.Trace:
							console.trace(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.Debug:
							console.debug(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.Information:
							console.info(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.Warning:
							console.warn(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.Error:
							console.error(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.Critical:
							console.error(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;

						case LogLevel.None:
							console.log(
								categoryName.name,
								message,
								...optionalParams,
							);
							break;
					}
				},
				isEnabled: (): boolean => true,
			}),
			dispose: async (): Promise<void> => {},
		}),
	)
	.inSingletonScope();

container.bind(StaticFileMiddleware).toSelf().inSingletonScope();

container.bind(HttpLoggingMiddleware).toSelf().inSingletonScope();

const main = async (): Promise<void> => {
	const builder = createWebAppBuilder(/* TODO */);

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

main();
