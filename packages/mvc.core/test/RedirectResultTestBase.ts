import { IServiceProvider } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	ServiceCollection,
	addTransientCtor,
} from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILoggerFactory,
	NullLogger,
	NullLoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { HttpContext } from '@yohira/http';
import {
	IHttpContext,
	PathString,
	StatusCodes,
} from '@yohira/http.abstractions';
import { HeaderNames } from '@yohira/http.headers';
import { expect, test } from 'vitest';

function getServiceProvider(): IServiceProvider {
	const serviceCollection = new ServiceCollection();
	addTransientCtor(serviceCollection, ILoggerFactory, NullLoggerFactory);
	addTransientCtor(serviceCollection, Symbol.for('ILoggerT<>'), NullLogger);
	return buildServiceProvider(serviceCollection);
}

function getHttpContext(appRoot: string | undefined): IHttpContext {
	const httpContext = HttpContext.createWithDefaultFeatureCollection();
	httpContext.requestServices = getServiceProvider();
	httpContext.request.pathBase = new PathString(appRoot);
	return httpContext;
}

// https://github.com/dotnet/aspnetcore/blob/main/src/Shared/ResultsTests/RedirectResultTestBase.cs#L14
export abstract class RedirectResultTestBase {
	protected abstract execute(
		httpContext: IHttpContext,
		contentPath: string,
	): Promise<void>;

	async Execute_ReturnsContentPath_WhenItDoesNotStartWithTilde(
		appRoot: string,
		contentPath: string,
		expectedPath: string,
	): Promise<void> {
		const httpContext = getHttpContext(appRoot);

		await this.execute(httpContext, contentPath);

		expect(
			httpContext.response.headers.getHeader(HeaderNames.Location),
		).toBe(expectedPath);
		expect(httpContext.response.statusCode).toBe(
			StatusCodes.Status302Found,
		);
	}

	async Execute_ReturnsAppRelativePath_WhenItStartsWithTilde(
		appRoot: string | undefined,
		contentPath: string,
		expectedPath: string,
	): Promise<void> {
		const httpContext = getHttpContext(appRoot);

		await this.execute(httpContext, contentPath);

		expect(
			httpContext.response.headers.getHeader(HeaderNames.Location),
		).toBe(expectedPath);
		expect(httpContext.response.statusCode).toBe(
			StatusCodes.Status302Found,
		);
	}
}

export function testRedirectResult(
	redirectResultTest: RedirectResultTestBase,
): void {
	test('Execute_ReturnsContentPath_WhenItDoesNotStartWithTilde', async () => {
		await Promise.all(
			(
				[
					['', '/Home/About', '/Home/About'],
					['/myapproot', '/test', '/test'],
				] as const
			).map(([appRoot, contentPath, expectedPath]) =>
				redirectResultTest.Execute_ReturnsContentPath_WhenItDoesNotStartWithTilde(
					appRoot,
					contentPath,
					expectedPath,
				),
			),
		);
	});

	/* TODO: test('Execute_ReturnsAppRelativePath_WhenItStartsWithTilde', async () => {
		await Promise.all(
			(
				[
					[undefined, '~/Home/About', '/Home/About'],
					['/', '~/Home/About', '/Home/About'],
					['/', '~/', '/'],
					['', '~/Home/About', '/Home/About'],
					['/myapproot', '~/', '/myapproot/'],
				] as const
			).map(([appRoot, contentPath, expectedPath]) =>
				redirectResultTest.Execute_ReturnsAppRelativePath_WhenItStartsWithTilde(
					appRoot,
					contentPath,
					expectedPath,
				),
			),
		);
	}); */
}
