import { Type } from '@yohira/base/Type';
import { createWebAppBuilder } from '@yohira/core/default-builder/WebApp';
import {
	addSingletonCtor,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions/ServiceCollectionServiceExtensions';
import { HostingEnv } from '@yohira/hosting/internal/HostingEnv';
import { initialize } from '@yohira/hosting/internal/HostingEnvironmentExtensions';
import {
	HttpLoggingMiddleware,
	useHttpLogging,
} from '@yohira/http-logging/HttpLoggingMiddleware';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';
import { HttpContext } from '@yohira/http/HttpContext';
import {
	StaticFileMiddleware,
	useStaticFiles,
} from '@yohira/static-files/StaticFileMiddleware';

export async function main(): Promise<void> {
	const builder = createWebAppBuilder(/* TODO */);

	// TODO: Remove.
	{
		const hostingEnv = new HostingEnv();
		initialize(hostingEnv, '' /* TODO */, {} /* TODO */);
		addSingletonInstance(
			builder.services,
			Type.from('IWebHostEnv'),
			hostingEnv,
		);

		addSingletonCtor(
			builder.services,
			Type.from('StaticFileMiddleware'),
			StaticFileMiddleware,
		);

		addSingletonCtor(
			builder.services,
			Type.from('HttpLoggingMiddleware'),
			HttpLoggingMiddleware,
		);
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
}
