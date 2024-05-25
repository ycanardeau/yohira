import {
	AuthenticationProperties,
	IAuthenticationService,
} from '@yohira/authentication.abstractions';
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
import { ForbidResult } from '@yohira/mvc.core';
import { expect, test, vi } from 'vitest';

function createServices(auth: IAuthenticationService): IServiceProvider {
	let $: IServiceCollection = new ServiceCollection();
	$ = addSingletonInstance($, ILoggerFactory, NullLoggerFactory.instance);
	$ = addSingletonInstance($, IAuthenticationService, auth);
	return buildServiceProvider($);
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ForbidResultTest.cs#L18C23-L18C83
test('ExecuteResultAsync_InvokesForbidAsyncOnAuthenticationService', async () => {
	const auth: IAuthenticationService = {
		forbid(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			return Promise.resolve();
		},
	} as IAuthenticationService;
	const forbidSpy = vi.spyOn(auth, 'forbid');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new ForbidResult([''], undefined);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(forbidSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ForbidResultTest.cs#L44
test('ExecuteResultAsync_InvokesForbidAsyncOnAllConfiguredSchemes', async () => {
	const authProperties = AuthenticationProperties.create();
	const auth: IAuthenticationService = {
		forbid(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === 'Scheme1' &&
				properties === authProperties
			) {
				return Promise.resolve();
			} else if (
				context === httpContext &&
				scheme === 'Scheme2' &&
				properties === authProperties
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const forbidSpy = vi.spyOn(auth, 'forbid');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new ForbidResult(['Scheme1', 'Scheme2'], authProperties);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(forbidSpy).toHaveBeenCalledTimes(2);
});

const ExecuteResultAsync_InvokesForbidAsyncWithAuthPropertiesData = [
	undefined,
	AuthenticationProperties.create(),
] as const;

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ForbidResultTest.cs#L83
test('ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties', async () => {
	async function ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties(
		expected: AuthenticationProperties | undefined,
	): Promise<void> {
		const auth: IAuthenticationService = {
			forbid(context, scheme, properties): Promise<void> {
				if (
					context === httpContext &&
					scheme === undefined &&
					properties === expected
				) {
					return Promise.resolve();
				} else {
					throw new Error('Method not supported.');
				}
			},
		} as IAuthenticationService;
		const forbidSpy = vi.spyOn(auth, 'forbid');
		const httpContext: IHttpContext = {
			get requestServices(): IServiceProvider {
				return createServices(auth);
			},
		} as IHttpContext;
		const result = new ForbidResult([], expected);

		const actionContext = new ActionContext(httpContext);

		await result.executeResult(actionContext);

		expect(forbidSpy).toHaveBeenCalledOnce();
	}

	await Promise.all(
		ExecuteResultAsync_InvokesForbidAsyncWithAuthPropertiesData.map(
			(expected) =>
				ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties(
					expected,
				),
		),
	);
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ForbidResultTest.cs#L110
test('ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties_WhenAuthenticationSchemesIsEmpty', async () => {
	async function ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties_WhenAuthenticationSchemesIsEmpty(
		expected: AuthenticationProperties | undefined,
	): Promise<void> {
		const auth: IAuthenticationService = {
			forbid(context, scheme, properties): Promise<void> {
				if (
					context === httpContext &&
					scheme === undefined &&
					properties === expected
				) {
					return Promise.resolve();
				} else {
					throw new Error('Method not supported.');
				}
			},
		} as IAuthenticationService;
		const forbidSpy = vi.spyOn(auth, 'forbid');
		const httpContext: IHttpContext = {
			get requestServices(): IServiceProvider {
				return createServices(auth);
			},
		} as IHttpContext;
		const result = ((): ForbidResult => {
			const result = new ForbidResult([], expected);
			result.authenticationSchemes = [];
			return result;
		})();

		const actionContext = new ActionContext(httpContext);

		await result.executeResult(actionContext);

		expect(forbidSpy).toHaveBeenCalledOnce();
	}

	await Promise.all(
		ExecuteResultAsync_InvokesForbidAsyncWithAuthPropertiesData.map(
			(expected) =>
				ExecuteResultAsync_InvokesForbidAsyncWithAuthProperties_WhenAuthenticationSchemesIsEmpty(
					expected,
				),
		),
	);
});
