import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	addSingletonCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';
import { RedirectResult, RedirectResultExecutor } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

import {
	RedirectResultTestBase,
	testRedirectResult,
} from './RedirectResultTestBase';

function getServiceProvider(): IServiceProvider {
	const serviceCollection = new ServiceCollection();
	addSingletonCtor(
		serviceCollection,
		Symbol.for('IActionResultExecutor<RedirectResult>'),
		RedirectResultExecutor,
	);
	// TODO: addSingletonCtor(serviceCollection, IUrlHelperFactory, UrlHelperFactory);
	addSingletonCtor(serviceCollection, ILoggerFactory, NullLoggerFactory);
	return buildServiceProvider(serviceCollection);
}

class RedirectResultTest extends RedirectResultTestBase {
	protected execute(
		httpContext: IHttpContext,
		contentPath: string,
	): Promise<void> {
		httpContext.requestServices = getServiceProvider();
		const actionContext = new ActionContext(httpContext);

		const redirectResult = new RedirectResult(contentPath, false, false);
		return redirectResult.executeResult(actionContext);
	}
}

testRedirectResult(new RedirectResultTest());

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/RedirectResultTest.cs#L35C17-L35C105
test('RedirectResult_Constructor_WithParameterUrl_SetsResultUrlAndNotPermanentOrPreserveMethod', () => {
	const url = '/test/url';

	const result = new RedirectResult(url, false, false);

	expect(result.preserveMethod).toBe(false);
	expect(result.permanent).toBe(false);
	expect(result.url).toBe(url);
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/RedirectResultTest.cs#L50C17-L50C115
test('RedirectResult_Constructor_WithParameterUrlAndPermanent_SetsResultUrlAndPermanentNotPreserveMethod', () => {
	const url = '/test/url';

	const result = new RedirectResult(url, true, false);

	expect(result.preserveMethod).toBe(false);
	expect(result.permanent).toBe(true);
	expect(result.url).toBe(url);
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/RedirectResultTest.cs#L65C17-L65C128
test('RedirectResult_Constructor_WithParameterUrlPermanentAndPreservesMethod_SetsResultUrlPermanentAndPreservesMethod', () => {
	const url = '/test/url';

	const result = new RedirectResult(url, true, true);

	expect(result.preserveMethod).toBe(true);
	expect(result.permanent).toBe(true);
	expect(result.url).toBe(url);
});
