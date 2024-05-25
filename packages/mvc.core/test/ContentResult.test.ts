import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	addSingletonInstance,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	LoggerT,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { StringSegment } from '@yohira/extensions.primitives';
import { HttpContext } from '@yohira/http';
import { IHttpContext } from '@yohira/http.abstractions';
import { MediaTypeHeaderValue } from '@yohira/http.headers';
import { ActionContext } from '@yohira/mvc.abstractions';
import { ContentResult, ContentResultExecutor } from '@yohira/mvc.core';
import { expect, test } from 'vitest';

function createServices(): IServiceCollection {
	// TODO

	const services = new ServiceCollection();
	addSingletonInstance(
		services,
		Symbol.for('IActionResultExecutor<ContentResult>'),
		new ContentResultExecutor(
			new LoggerT<ContentResultExecutor>(NullLoggerFactory.instance),
		),
	);
	addSingletonInstance(services, ILoggerFactory, NullLoggerFactory.instance);
	return services;
}

function getHttpContext(): IHttpContext {
	const services = createServices();

	const httpContext = HttpContext.createWithDefaultFeatureCollection();
	httpContext.requestServices = buildServiceProvider(services);

	return httpContext;
}

function getActionContext(httpContext: IHttpContext): ActionContext {
	return new ActionContext(httpContext);
}

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ContentResultTest.cs#L24
test('ContentResult_ExecuteResultAsync_Response_NullContent_SetsContentTypeAndEncoding', async () => {
	const contentResult = ((): ContentResult => {
		const contentResult = new ContentResult();
		contentResult.content = undefined;
		contentResult.contentType = new MediaTypeHeaderValue(
			StringSegment.from('text/plain'),
		).toString();
		return contentResult;
	})();
	const httpContext = getHttpContext();
	const actionContext = getActionContext(httpContext);

	await contentResult.executeResult(actionContext);

	expect(httpContext.response.contentType).toBe('text/plain; charset=utf-8');
});

// https://github.com/dotnet/aspnetcore/blob/49c1c68bf1ac4f1f28db5c1b33ec5b7bab35546b/src/Mvc/Mvc.Core/test/ContentResultTest.cs#L114C23-L114C92
/* TODO: test('ContentResult_ExecuteResultAsync_SetContentTypeAndEncoding_OnResponse', async () => {
	async function ContentResult_ExecuteResultAsync_SetContentTypeAndEncoding_OnResponse(
		contentType: MediaTypeHeaderValue | undefined,
		content: string,
		responseContentType: string | undefined,
		expectedContentType: string,
		expectedContentData: Buffer,
	): Promise<void> {
		const contentResult = ((): ContentResult => {
			const contentResult = new ContentResult();
			contentResult.content = content;
			contentResult.contentType = contentType?.toString();
			return contentResult;
		})();
		const httpContext = getHttpContext();
		// TODO: const memoryStream = MemoryStream.alloc();
		// TODO: httpContext.response.body = memoryStream;
		httpContext.response.contentType = responseContentType;
		const actionContext = getActionContext(httpContext);

		await contentResult.executeResult(actionContext);

		const finalResponseContentType = httpContext.response.contentType;
		expect(finalResponseContentType).toBe(expectedContentType);
		// TODO: expect(memoryStream.toBuffer()).toBe(expectedContentData);
		expect(httpContext.response.contentLength).toBe(
			expectedContentData.length,
		);
	}

	await Promise.all(
		(
			[
				[
					undefined,
					'κόσμε',
					undefined,
					'text/plain; charset=utf-8',
					Buffer.from([
						206, 186, 225, 189, 185, 207, 131, 206, 188, 206, 181,
					]), //utf-8 without BOM
				],
				[
					new MediaTypeHeaderValue(StringSegment.from('text/foo')),
					'κόσμε',
					undefined,
					'text/foo',
					Buffer.from([
						206, 186, 225, 189, 185, 207, 131, 206, 188, 206, 181,
					]), //utf-8 without BOM
				],
				[
				MediaTypeHeaderValue.parse('text/foo;p1=p1-value'),
				'κόσμε',
				undefined,
				'text/foo; p1=p1-value',
				Buffer.from([
					206, 186, 225, 189, 185, 207, 131, 206, 188, 206, 181,
				]), //utf-8 without BOM
			],
				[
					new MediaTypeHeaderValue(StringSegment.from('text/foo')),
					// TODO: Encoding = Encoding.ASCII
					'abcd',
					undefined,
					'text/foo; charset=us-ascii',
					Buffer.from([97, 98, 99, 100]),
				],
				[
					undefined,
					'abcd',
					'text/bar',
					'text/bar',
					Buffer.from([97, 98, 99, 100]),
				],
				[
					undefined,
					'abcd',
					'application/xml; charset=us-ascii',
					'application/xml; charset=us-ascii',
					Buffer.from([97, 98, 99, 100]),
				],
				[
					undefined,
					'abcd',
					'Invalid content type',
					'Invalid content type',
					Buffer.from([97, 98, 99, 100]),
				],
				[
					new MediaTypeHeaderValue(StringSegment.from('text/foo')),
					// TODO: Charset = 'us-ascii'
					'abcd',
					'text/bar',
					'text/foo; charset=us-ascii',
					Buffer.from([97, 98, 99, 100]),
				],
			] as const
		).map(
			([
				contentType,
				content,
				responseContentType,
				expectedContentType,
				expectedContentData,
			]) =>
				ContentResult_ExecuteResultAsync_SetContentTypeAndEncoding_OnResponse(
					contentType,
					content,
					responseContentType,
					expectedContentType,
					expectedContentData,
				),
		),
	);
}); */

// TODO
