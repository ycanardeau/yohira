import { IReadonlyList } from '@yohira/base';
import { Endpoint, IHttpContext } from '@yohira/http.abstractions';

import { DataSourceDependentCache } from '../DataSourceDependentCache';
import { EndpointDataSource } from '../EndpointDataSource';
import { RouteEndpoint } from '../RouteEndpoint';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DataSourceDependentMatcher.cs,44802b720f2051eb,references
export class DataSourceDependentMatcher extends Matcher {
	private readonly cache: DataSourceDependentCache<Matcher>;

	private createMatcher = (endpoints: IReadonlyList<Endpoint>): Matcher => {
		const builder = this.matcherBuilderFactory();
		const seenEndpointNames = new Map<string, string | undefined>();
		for (let i = 0; i < endpoints.count; i++) {
			const endpoint = endpoints.get(i);
			if (endpoint instanceof RouteEndpoint) {
				// TODO: Validate that endpoint names are unique.

				if (true /* TODO */) {
					builder.addEndpoint(endpoint);
				}
			}
		}

		return builder.build();
	};

	constructor(
		dataSource: EndpointDataSource,
		// TODO: lifetime,
		private readonly matcherBuilderFactory: () => MatcherBuilder,
	) {
		super();

		this.cache = new DataSourceDependentCache<Matcher>(
			dataSource,
			this.createMatcher,
		);
		this.cache.ensureInitialized();

		// TODO
	}

	// Used in tests
	/** @internal */ get currentMatcher(): Matcher {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.cache.value!;
	}

	match(httpContext: IHttpContext): Promise<void> {
		return this.currentMatcher.match(httpContext);
	}
}
