import { createWebAppBuilder } from '@yohira/core';
import { addHttpLogging, useHttpLogging } from '@yohira/http-logging';
import { use, write } from '@yohira/http.abstractions';
import { getEndpoint } from '@yohira/http.abstractions';
import { addRouting, mapGet, useEndpoints, useRouting } from '@yohira/routing';
import { addSession, useSession } from '@yohira/session';
import { addStaticFiles, useStaticFiles } from '@yohira/static-files';

export async function main(): Promise<void> {
	const builder = createWebAppBuilder(/* TODO */);

	addStaticFiles(builder.services);

	addHttpLogging(builder.services);

	addRouting(builder.services);

	// TODO: addDistributedMemoryCache(builder.services);

	addSession(builder.services, (options) => {
		// TODO: options.idleTimeout =
		options.cookie.httpOnly = true;
		options.cookie.isEssential = true;
	});

	// TODO

	const app = builder.build();

	useStaticFiles(app);

	useHttpLogging(app);

	use(app, async (context, next) => {
		console.log(
			`1. Endpoint: ${
				getEndpoint(context)?.displayName ?? '(undefined)'
			}`,
		);
		await next(context);
	});

	useRouting(app);

	useSession(app);

	use(app, async (context, next) => {
		console.log(
			`2. Endpoint: ${
				getEndpoint(context)?.displayName ?? '(undefined)'
			}`,
		);
		await next(context);
	});

	mapGet(app, '/', async (context) => {
		console.log(
			`3. Endpoint: ${
				getEndpoint(context)?.displayName ?? '(undefined)'
			}`,
		);
		await write(context.response, 'Hello World!');
	});

	useEndpoints(app, () => {});

	use(app, async (context, next) => {
		console.log(
			`4. Endpoint: ${
				getEndpoint(context)?.displayName ?? '(undefined)'
			}`,
		);
		await next(context);
	});

	await app.run();
}

main();
