import { createWebAppBuilder } from '@yohira/core/default-builder/WebApp';
import { IOptions } from '@yohira/extensions.options/IOptions';
import { IOptionsMonitor } from '@yohira/extensions.options/IOptionsMonitor';
import { IWebHostEnv } from '@yohira/hosting.abstractions/IWebHostEnv';
import { GenericWebHostServiceOptions } from '@yohira/hosting/generic-host/GenericWebHostServiceOptions';
import { HostingEnv } from '@yohira/hosting/internal/HostingEnv';
import { initialize } from '@yohira/hosting/internal/HostingEnvironmentExtensions';
import {
	HttpLoggingMiddleware,
	useHttpLogging,
} from '@yohira/http-logging/HttpLoggingMiddleware';
import { HttpLoggingOptions } from '@yohira/http-logging/HttpLoggingOptions';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';
import { HttpContext } from '@yohira/http/HttpContext';
import {
	StaticFileMiddleware,
	StaticFileOptions,
	useStaticFiles,
} from '@yohira/static-files/StaticFileMiddleware';

export const main = async (): Promise<void> => {
	const builder = createWebAppBuilder(/* TODO */);

	// TODO: Remove.
	{
		const container = builder.services;

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
