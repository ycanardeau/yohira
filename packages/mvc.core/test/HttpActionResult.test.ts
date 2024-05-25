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
import { ActionContext, IResult } from '@yohira/mvc.abstractions';
import { HttpActionResult } from '@yohira/mvc.core';
import { expect, test, vi } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/HttpActionResultTests.cs#L17C17-L17C69
test('HttpActionResult_InitializesWithResultsStaticMethods', () => {
	const httpResult: IResult = {} as IResult;
	const result = new HttpActionResult(httpResult);

	expect(result.result).toBe(httpResult);
});

function createServices(): IServiceCollection {
	const services = new ServiceCollection();
	addSingletonInstance(services, ILoggerFactory, NullLoggerFactory.instance);
	return services;
}

test('HttpActionResult_InvokesInternalHttpResult', async () => {
	const httpContext = HttpContext.createWithDefaultFeatureCollection();
	httpContext.requestServices = buildServiceProvider(createServices());

	const context = new ActionContext(httpContext);

	const httpResult: IResult = {
		execute() {
			return Promise.resolve();
		},
	};
	const executeSpy = vi.spyOn(httpResult, 'execute');
	const result = new HttpActionResult(httpResult);

	await result.executeResult(context);

	expect(executeSpy).toHaveBeenCalledOnce();
});
