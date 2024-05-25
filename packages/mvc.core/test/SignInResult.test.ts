import {
	AuthenticationProperties,
	IAuthenticationService,
} from '@yohira/authentication.abstractions';
import { ClaimsPrincipal, IServiceProvider } from '@yohira/base';
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
import { SignInResult } from '@yohira/mvc.core';
import { expect, test, vi } from 'vitest';

function createServices(auth: IAuthenticationService): IServiceProvider {
	let $: IServiceCollection = new ServiceCollection();
	$ = addSingletonInstance($, ILoggerFactory, NullLoggerFactory.instance);
	$ = addSingletonInstance($, IAuthenticationService, auth);
	return buildServiceProvider($);
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignInResultTest.cs#L19C23-L19C83
test('ExecuteResultAsync_InvokesSignInAsyncOnAuthenticationManager', async () => {
	const claimsPrincipal = new ClaimsPrincipal();
	const auth: IAuthenticationService = {
		signIn(
			context: IHttpContext,
			scheme: string | undefined,
			principal: ClaimsPrincipal,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === '' &&
				principal === claimsPrincipal &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signInSpy = vi.spyOn(auth, 'signIn');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignInResult('', claimsPrincipal, undefined);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(signInSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignInResultTest.cs#L46
test('ExecuteResultAsync_InvokesSignInAsyncOnAuthenticationManagerWithDefaultScheme', async () => {
	const claimsPrincipal = new ClaimsPrincipal();
	const authProperties = AuthenticationProperties.create();
	const auth: IAuthenticationService = {
		signIn(
			context: IHttpContext,
			scheme: string | undefined,
			principal: ClaimsPrincipal,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === 'Scheme1' &&
				principal === claimsPrincipal &&
				properties === authProperties
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signInSpy = vi.spyOn(auth, 'signIn');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignInResult('Scheme1', claimsPrincipal, authProperties);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(signInSpy).toHaveBeenCalledOnce();
});
