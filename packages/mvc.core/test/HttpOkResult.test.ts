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
import { HttpContext } from '@yohira/http';
import { StatusCodes } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';
import { OkResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpOkResultTest.cs#L16
test('HttpOkResult_InitializesStatusCode', () => {
	const result = new OkResult();

	expect(result.statusCode).toBe(StatusCodes.Status200OK);
});

function createServices(): IServiceCollection {
	const services = new ServiceCollection();
	addSingletonInstance(services, ILoggerFactory, NullLoggerFactory.instance);
	return services;
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpOkResultTest.cs#L26
test('HttpOkResult_SetsStatusCode', async () => {
	const httpContext = HttpContext.createWithDefaultFeatureCollection();
	httpContext.requestServices = buildServiceProvider(createServices());

	const context = new ActionContext(httpContext);
	const result = new OkResult();

	await result.executeResult(context);

	expect(context.httpContext.response.statusCode).toBe(
		StatusCodes.Status200OK,
	);
});
