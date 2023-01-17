import { Type } from '@yohira/base';
import { createWebAppBuilder } from '@yohira/core';
import { addSingletonCtor } from '@yohira/extensions.dependency-injection.abstractions';
import { HttpContext } from '@yohira/http';
import { HttpLoggingMiddleware, useHttpLogging } from '@yohira/http-logging';
import { use } from '@yohira/http.abstractions';
import { StaticFileMiddleware, useStaticFiles } from '@yohira/static-files';

export async function main(): Promise<void> {
	const builder = createWebAppBuilder(/* TODO */);

	// TODO: Remove.
	{
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
