import { createWebAppBuilder } from '@/builder/WebApp';
import { HostingEnv } from '@/fileProviders/HostingEnv';
import { IWebHostEnv, initialize } from '@/hosting/IWebHostEnv';
import { HttpContext } from '@/http/HttpContext';
import { use } from '@/http/IAppBuilder';
import { container } from '@/inversify.config';
import { ILogger } from '@/logging/ILogger';
import { ILoggerFactory } from '@/logging/ILoggerFactory';
import {
	StaticFileMiddleware,
	StaticFileOptions,
	useStaticFiles,
} from '@/middleware/staticFiles/StaticFileMiddleware';
import { IOptions } from '@/options/IOptions';

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
	.bind(ILoggerFactory)
	.toDynamicValue(
		(): ILoggerFactory => ({
			createLogger: (): ILogger => ({
				debug: (message, ...optionalParams) =>
					console.debug(message, ...optionalParams),
				warn: (message, ...optionalParams) =>
					console.warn(message, ...optionalParams),
			}),
			dispose: async (): Promise<void> => {},
		}),
	)
	.inSingletonScope();

container.bind(StaticFileMiddleware).toSelf().inSingletonScope();

const main = async (): Promise<void> => {
	const builder = createWebAppBuilder(/* TODO */);

	// TODO

	const app = builder.build();

	useStaticFiles(app);

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
