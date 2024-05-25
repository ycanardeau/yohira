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
import { IHttpContext, StatusCodes } from '@yohira/http.abstractions';
import { ActionContext } from '@yohira/mvc.abstractions';
import { IStatusCodeActionResult, StatusCodeResult } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

function createServices(): IServiceCollection {
	const services = new ServiceCollection();
	addSingletonInstance(services, ILoggerFactory, NullLoggerFactory.instance);
	return services;
}

function getHttpContext(): IHttpContext {
	const services = createServices();

	const httpContext = HttpContext.createWithDefaultFeatureCollection();
	httpContext.requestServices = buildServiceProvider(services);

	return httpContext;
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpStatusCodeResultTests.cs#L17C17-L17C73
test('HttpStatusCodeResult_ExecuteResultSetsResponseStatusCode', () => {
	const result = new StatusCodeResult(StatusCodes.Status404NotFound);

	const httpContext = getHttpContext();

	const context = new ActionContext(httpContext);

	result.executeResultSync(context);

	expect(httpContext.response.statusCode).toBe(StatusCodes.Status404NotFound);
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpStatusCodeResultTests.cs#L36C17-L36C87
test('HttpStatusCodeResult_ReturnsCorrectStatusCodeAsIStatusCodeActionResult', () => {
	const result = new StatusCodeResult(StatusCodes.Status404NotFound);

	const statusResult = result as IStatusCodeActionResult;

	expect(statusResult.statusCode).toBe(StatusCodes.Status404NotFound);
});
