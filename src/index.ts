import { createWebAppBuilder } from '@/builder/WebApp';
import { HostingEnv } from '@/hosting/HostingEnv';
import { IWebHostEnv, initialize } from '@/hosting/IWebHostEnv';
import { HttpContext } from '@/http/HttpContext';
import { use } from '@/http/IAppBuilder';
import { container } from '@/inversify.config';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
import { LogLevel } from '@/logging/LogLevel';
import {
	HttpLoggingMiddleware,
	useHttpLogging,
} from '@/middleware/httpLogging/HttpLoggingMiddleware';
import { HttpLoggingOptions } from '@/middleware/httpLogging/HttpLoggingOptions';
import {
	StaticFileMiddleware,
	StaticFileOptions,
	useStaticFiles,
} from '@/middleware/staticFiles/StaticFileMiddleware';
import { IOptions, IOptionsMonitor } from '@yohira/options';

// TODO
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

	app.run();
};

main();
