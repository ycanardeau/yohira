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
import { ActionContext, IResult } from '@yohira/mvc.abstractions';
import { SignOutResult } from '@yohira/mvc.core';
import { expect, test, vi } from 'vitest';

function createServices(auth: IAuthenticationService): IServiceProvider {
	let $: IServiceCollection = new ServiceCollection();
	$ = addSingletonInstance($, ILoggerFactory, NullLoggerFactory.instance);
	$ = addSingletonInstance($, IAuthenticationService, auth);
	return buildServiceProvider($);
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L18C23-L18C69
test('ExecuteResultAsync_NoArgsInvokesDefaultSignOut', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === undefined &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult([], undefined);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(signOutSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L44C23-L44C84
test('ExecuteResultAsync_InvokesSignOutAsyncOnAuthenticationManager', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === '' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult([''], undefined);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(signOutSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L70
test('ExecuteResultAsync_InvokesSignOutAsyncOnAllConfiguredSchemes', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === 'Scheme1' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else if (
				context === httpContext &&
				scheme === 'Scheme2' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult(['Scheme1', 'Scheme2'], undefined);

	const actionContext = new ActionContext(httpContext);

	await result.executeResult(actionContext);

	expect(signOutSpy).toHaveBeenCalledTimes(2);
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L101C23-L101C63
test('ExecuteAsync_NoArgsInvokesDefaultSignOut', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === undefined &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult([], undefined);

	await (result as IResult).execute(httpContext);

	expect(signOutSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L121C23-L121C78
test('ExecuteAsync_InvokesSignOutAsyncOnAuthenticationManager', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === '' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult([''], undefined);

	await (result as IResult).execute(httpContext);

	expect(signOutSpy).toHaveBeenCalledOnce();
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/SignOutResultTest.cs#L141C23-L141C77
test('ExecuteAsync_InvokesSignOutAsyncOnAllConfiguredSchemes', async () => {
	const auth: IAuthenticationService = {
		signOut(
			context: IHttpContext,
			scheme: string | undefined,
			properties: AuthenticationProperties | undefined,
		): Promise<void> {
			if (
				context === httpContext &&
				scheme === 'Scheme1' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else if (
				context === httpContext &&
				scheme === 'Scheme2' &&
				properties === undefined
			) {
				return Promise.resolve();
			} else {
				throw new Error('Method not supported.');
			}
		},
	} as IAuthenticationService;
	const signOutSpy = vi.spyOn(auth, 'signOut');
	const httpContext: IHttpContext = {
		get requestServices(): IServiceProvider {
			return createServices(auth);
		},
	} as IHttpContext;
	const result = new SignOutResult(['Scheme1', 'Scheme2'], undefined);

	await (result as IResult).execute(httpContext);

	expect(signOutSpy).toHaveBeenCalledTimes(2);
});
