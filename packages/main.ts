import { createWebAppBuilder } from '@yohira/core';
import { HttpContext } from '@yohira/http';
import { addHttpLogging, useHttpLogging } from '@yohira/http-logging';
import { use } from '@yohira/http.abstractions';
import { addStaticFiles, useStaticFiles } from '@yohira/static-files';

export async function main(): Promise<void> {
	const builder = createWebAppBuilder(/* TODO */);

	addStaticFiles(builder.services);

	addHttpLogging(builder.services);

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
