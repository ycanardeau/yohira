import {
	AuthenticationProperties,
	IAuthenticationService,
} from '@yohira/authentication.abstractions';
import { addAuthenticationCore } from '@yohira/authentication.core';
import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';
import { ChallengeResult } from '@yohira/mvc.core';
import { expect, test, vi } from 'vitest';

function createServices(): IServiceCollection {
	const services = new ServiceCollection();
	addSingletonInstance(services, ILoggerFactory, NullLoggerFactory.instance);
	addAuthenticationCore(services);
	return services;
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ChallengeResultTest.cs#L18C23-L18C57
test('ChallengeResult_ExecuteResultAsync', async () => {
	const result = new ChallengeResult([''], undefined);

	const auth: IAuthenticationService = {
		challenge(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			return Promise.resolve();
		},
	} as IAuthenticationService;
	const challengeSpy = vi.spyOn(auth, 'challenge');

	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return buildServiceProvider(
				addSingletonInstance(
					createServices(),
					IAuthenticationService,
					auth,
				),
			);
		},
	} as IHttpContext;

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(challengeSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ChallengeResultTest.cs#L44C23-L44C67
test('ChallengeResult_ExecuteResultAsync_NoSchemes', async () => {
	const result = new ChallengeResult([], undefined);

	const auth: IAuthenticationService = {
		challenge(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			return Promise.resolve();
		},
	} as IAuthenticationService;
	const challengeSpy = vi.spyOn(auth, 'challenge');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return buildServiceProvider(
				addSingletonInstance(
					createServices(),
					IAuthenticationService,
					auth,
				),
			);
		},
	} as IHttpContext;

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(challengeSpy).toHaveBeenCalledOnce();
});
