import { addAuthentication, useAuthentication } from '@yohira/authentication';
import {
	AuthenticationProperties,
	Claim,
	ClaimTypes,
	ClaimsIdentity,
	ClaimsPrincipal,
	signIn,
	signOut,
} from '@yohira/authentication.abstractions';
import {
	CookieAuthenticationDefaults,
	addCookie,
} from '@yohira/authentication.cookies';
import { createWebAppBuilder } from '@yohira/core';
import { addDistributedMemoryCache } from '@yohira/extensions.caching.memory';
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

	addDistributedMemoryCache(builder.services);

	addSession(builder.services, (options) => {
		// TODO: options.idleTimeout =
		options.cookie.httpOnly = true;
		options.cookie.isEssential = true;
	});

	addCookie(
		addAuthentication(
			builder.services,
			CookieAuthenticationDefaults.authenticationScheme,
		),
	);

	// TODO

	const app = builder.build();

	useStaticFiles(app);

	useHttpLogging(app);

	useAuthentication(app);
	//useAuthorization(app);

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

	mapGet(app, '/signIn', async (context) => {
		const claims: Claim[] = [
			new Claim(ClaimTypes.name, 'Name'),
			new Claim('FullName', 'FullName'),
			new Claim(ClaimTypes.role, 'Administrator'),
		];

		const claimsIdentity = new ClaimsIdentity(
			undefined,
			claims,
			CookieAuthenticationDefaults.authenticationScheme,
			undefined,
			undefined,
		);

		const authProperties = new AuthenticationProperties(
			undefined,
			undefined,
		);

		await signIn(
			context,
			CookieAuthenticationDefaults.authenticationScheme,
			ClaimsPrincipal.fromIdentity(claimsIdentity),
			authProperties,
		);

		await write(context.response, JSON.stringify({}));
	});

	mapGet(app, '/signOut', async (context) => {
		const authProperties = new AuthenticationProperties(
			undefined,
			undefined,
		);

		await signOut(
			context,
			CookieAuthenticationDefaults.authenticationScheme,
			authProperties,
		);

		await write(context.response, JSON.stringify({}));
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
