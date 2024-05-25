import { typedef } from '@yohira/base';
import { buildServiceProvider } from '@yohira/extensions.dependency-injection';
import {
	IServiceCollection,
	ServiceCollection,
	getRequiredService,
} from '@yohira/extensions.dependency-injection.abstractions';
import { FeatureCollection } from '@yohira/extensions.features';
import { addLogging } from '@yohira/extensions.logging';
import { addOptions } from '@yohira/extensions.options';
import { HttpContext, HttpRequestFeature } from '@yohira/http';
import {
	EndpointMetadataCollection,
	HttpMethods,
	IHttpContext,
	PathString,
	getEndpoint,
} from '@yohira/http.abstractions';
import { IHttpRequestFeature } from '@yohira/http.features';
import {
	DfaMatcherBuilder,
	HttpMethodMetadata,
	IDynamicEndpointMetadata,
	Matcher,
	RouteEndpoint,
	addRouting,
	http405EndpointDisplayName,
	parseRoutePattern,
	preflightHttpMethod,
} from '@yohira/routing';
import { expect, test } from 'vitest';

import { emptyRequestDelegate } from '../TestConstants';
import { assertMatch } from './MatcherAssert';

@typedef({
	implements: [IDynamicEndpointMetadata],
})
class DynamicEndpointMetadata implements IDynamicEndpointMetadata {
	get isDynamic(): boolean {
		return true;
	}
}

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L13
export abstract class HttpMethodMatcherPolicyIntegrationTestBase {
	protected abstract get hasDynamicMetadata(): boolean;

	createEndpoint(
		template: string,
		{
			order = 0,
			httpMethods,
			acceptCorsPreflight = false,
		}: {
			// TODO: defaults,
			// TODO: constraints,
			order?: number;
			httpMethods?: HttpMethods[];
			acceptCorsPreflight?: boolean;
		} = {},
	): RouteEndpoint {
		const metadata: object[] = [];
		if (httpMethods !== undefined) {
			metadata.push(
				new HttpMethodMetadata(httpMethods ?? [], acceptCorsPreflight),
			);
		}

		if (this.hasDynamicMetadata) {
			metadata.push(new DynamicEndpointMetadata());
		}

		const displayName =
			'endpoint: ' +
			template +
			' ' +
			(httpMethods ?? ['(any)']).join(', ');
		return new RouteEndpoint(
			emptyRequestDelegate,
			parseRoutePattern(template /* TODO */),
			order,
			new EndpointMetadataCollection(metadata),
			displayName,
		);
	}

	private static createMatcher(...endpoints: RouteEndpoint[]): Matcher {
		let $: IServiceCollection;
		$ = new ServiceCollection();
		$ = addOptions($);
		$ = addLogging($);
		$ = addRouting($);
		const services = buildServiceProvider($);

		const builder = getRequiredService<DfaMatcherBuilder>(
			services,
			Symbol.for('DfaMatcherBuilder'),
		);
		for (const endpoint of endpoints) {
			builder.addEndpoint(endpoint);
		}

		return builder.build();
	}

	static createContext(
		path: string,
		httpMethod: HttpMethods,
		corsPreflight = false,
	): IHttpContext {
		const httpContext = HttpContext.createWithDefaultFeatureCollection();
		httpContext.request.method = corsPreflight
			? preflightHttpMethod
			: httpMethod;
		httpContext.request.path = new PathString(path);

		if (corsPreflight) {
			// TODO
			throw new Error('Method not implemented.');
		}

		return httpContext;
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L18
	async Match_HttpMethod(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L34
	/* FIXME: async Match_HttpMethod_CORS(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
			acceptCorsPreflight: true,
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L50
	/* TODO: async Match_HttpMethod_CORS_Preflight(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
			acceptCorsPreflight: true,
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
				true,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L66
	/* TODO: async NotMatch_HttpMethod_CORS_Preflight(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
			acceptCorsPreflight: false,
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
				true,
			);

		await matcher.match(httpContext);

		expect(getEndpoint(httpContext)).not.toBe(endpoint);
		expect(getEndpoint(httpContext)?.displayName).toBe(
			http405EndpointDisplayName,
		);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L85
	async Match_HttpMethod_CaseInsensitive(): Promise<void> {
		const Match_HttpMethod_CaseInsensitive = async (
			endpointMethod: string,
			requestMethod: string,
		): Promise<void> => {
			const endpoint = this.createEndpoint('/hello', {
				httpMethods: [endpointMethod as HttpMethods],
			});

			const matcher =
				HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
					endpoint,
				);
			const httpContext =
				HttpMethodMatcherPolicyIntegrationTestBase.createContext(
					'/hello',
					requestMethod as HttpMethods,
				);

			await matcher.match(httpContext);

			assertMatch(httpContext, endpoint);
		};

		await Match_HttpMethod_CaseInsensitive('GeT', 'GET');
		await Match_HttpMethod_CaseInsensitive('unKNOWN', 'UNKNOWN');
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L103
	/* TODO: async Match_HttpMethod_CaseInsensitive_CORS_Preflight(): Promise<void> {
		const Match_HttpMethod_CaseInsensitive_CORS_Preflight = async (
			endpointMethod: string,
			requestMethod: string,
		): Promise<void> => {
			const endpoint = this.createEndpoint('/hello', {
				httpMethods: [endpointMethod as HttpMethods],
			});

			const matcher =
				HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
					endpoint,
				);
			const httpContext =
				HttpMethodMatcherPolicyIntegrationTestBase.createContext(
					'/hello',
					requestMethod as HttpMethods,
					true,
				);

			await matcher.match(httpContext);

			assertMatch(httpContext, endpoint);
		};

		await Match_HttpMethod_CaseInsensitive_CORS_Preflight('GeT', 'GET');
		await Match_HttpMethod_CaseInsensitive_CORS_Preflight(
			'unKNOWN',
			'UNKNOWN',
		);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L119
	async Match_NoMetadata_MatchesAnyHttpMethod(): Promise<void> {
		const endpoint = this.createEndpoint('/hello');

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L135
	/* TODO: async Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			acceptCorsPreflight: true,
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
				true,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L151
	/* TODO: async Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight_DoesNotSupportPreflight(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', {
			acceptCorsPreflight: false,
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
				true,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L167
	async Match_EmptyMethodList_MatchesAnyHttpMethod(): Promise<void> {
		const endpoint = this.createEndpoint('/hello', { httpMethods: [] });

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(endpoint);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint);
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L183
	/* TODO: async NotMatch_HttpMethod_Returns405Endpoint(): Promise<void> {
		const endpoint1 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get, HttpMethods.Put],
		});
		const endpoint2 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Delete],
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
				endpoint1,
				endpoint2,
			);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Post,
			);

		await matcher.match(httpContext);

		expect(getEndpoint(httpContext)).not.toBe(endpoint1);
		expect(getEndpoint(httpContext)).not.toBe(endpoint2);

		expect(getEndpoint(httpContext)?.displayName).toBe(
			http405EndpointDisplayName,
		);

		await getEndpoint(httpContext)?.requestDelegate?.(httpContext);
		expect(httpContext.response.statusCode).toBe(405);
		expect(httpContext.response.headers.get('Allow')).toBe(
			'DELETE, GET, PUT',
		);
	} */

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L208
	/* TODO: async NotMatch_HttpMethod_CORS_DoesNotReturn405(): Promise<void> {
		const endpoint1 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get, HttpMethods.Put],
			acceptCorsPreflight: true,
		});
		const endpoint2 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Delete],
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
				endpoint1,
				endpoint2,
			);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Post,
				true,
			);

		await matcher.match(httpContext);

		assertNotMatch(httpContext);
	} */

	// TODO

	async Match_EndpointWithHttpMethodPreferred(): Promise<void> {
		const endpoint1 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
		});
		const endpoint2 = this.createEndpoint('/bar');

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
				endpoint1,
				endpoint2,
			);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint1);
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L259
	async Match_EndpointWithHttpMethodPreferred_EmptyList(): Promise<void> {
		const endpoint1 = this.createEndpoint('/hello', {
			httpMethods: [HttpMethods.Get],
		});
		const endpoint2 = this.createEndpoint('/bar', {
			httpMethods: [],
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
				endpoint1,
				endpoint2,
			);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Get,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint1);
	}

	// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyIntegrationTestBase.cs#L276
	/* TODO: async Match_EndpointWithHttpMethodPreferred_FallsBackToNonSpecific(): Promise<void> {
		const endpoint1 = this.createEndpoint('/{x}', {
			httpMethods: [HttpMethods.Get],
		});
		const endpoint2 = this.createEndpoint('/{x}', {
			httpMethods: [],
		});

		const matcher =
			HttpMethodMatcherPolicyIntegrationTestBase.createMatcher(
				endpoint1,
				endpoint2,
			);
		const httpContext =
			HttpMethodMatcherPolicyIntegrationTestBase.createContext(
				'/hello',
				HttpMethods.Post,
			);

		await matcher.match(httpContext);

		assertMatch(httpContext, endpoint2, true);
	} */

	// TODO
}

export function testHttpMethodMatcherPolicy(
	httpMethodMatcherPolicyIntegrationTest: HttpMethodMatcherPolicyIntegrationTestBase,
): void {
	test('Match_HttpMethod', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_HttpMethod();
	});

	/* TODO: test('Match_HttpMethod_CORS', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_HttpMethod_CORS();
	}); */

	/* TODO: test('Match_HttpMethod_CORS_Preflight', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_HttpMethod_CORS_Preflight();
	}); */

	/* TODO: test('NotMatch_HttpMethod_CORS_Preflight', async () => {
		await httpMethodMatcherPolicyIntegrationTest.NotMatch_HttpMethod_CORS_Preflight();
	}); */

	test('Match_HttpMethod_CaseInsensitive', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_HttpMethod_CaseInsensitive();
	});

	/* TODO: test('Match_HttpMethod_CaseInsensitive_CORS_Preflight', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_HttpMethod_CaseInsensitive_CORS_Preflight();
	}); */

	test('Match_NoMetadata_MatchesAnyHttpMethod', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_NoMetadata_MatchesAnyHttpMethod();
	});

	/* TODO: test('Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight();
	}); */

	/* TODO: test('Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight_DoesNotSupportPreflight', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_NoMetadata_MatchesAnyHttpMethod_CORS_Preflight_DoesNotSupportPreflight();
	}); */

	test('Match_EmptyMethodList_MatchesAnyHttpMethod', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_EmptyMethodList_MatchesAnyHttpMethod();
	});

	/* TODO: test('NotMatch_HttpMethod_Returns405Endpoint', async () => {
		await httpMethodMatcherPolicyIntegrationTest.NotMatch_HttpMethod_Returns405Endpoint();
	}); */

	/* TODO: test('NotMatch_HttpMethod_CORS_DoesNotReturn405', async () => {
		await httpMethodMatcherPolicyIntegrationTest.NotMatch_HttpMethod_CORS_DoesNotReturn405();
	}); */

	test('Match_EndpointWithHttpMethodPreferred', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_EndpointWithHttpMethodPreferred();
	});

	test('Match_EndpointWithHttpMethodPreferred_EmptyList', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_EndpointWithHttpMethodPreferred_EmptyList();
	});

	/* TODO: test('Match_EndpointWithHttpMethodPreferred_FallsBackToNonSpecific', async () => {
		await httpMethodMatcherPolicyIntegrationTest.Match_EndpointWithHttpMethodPreferred_FallsBackToNonSpecific();
	}); */

	/* TODO: test('NotMatch_HttpMethod_Returns405Endpoint_ReExecute', async () => {
		await httpMethodMatcherPolicyIntegrationTest.NotMatch_HttpMethod_Returns405Endpoint_ReExecute();
	}); */
}
