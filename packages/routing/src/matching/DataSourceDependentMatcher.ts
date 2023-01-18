import { IHttpContext } from '@yohira/http.abstractions';

import { EndpointDataSource } from '../EndpointDataSource';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DataSourceDependentMatcher.cs,44802b720f2051eb,references
export class DataSourceDependentMatcher extends Matcher {
	constructor(
		dataSource: EndpointDataSource,
		// TODO: lifetime,
		private readonly matcherBuilderFactory: () => MatcherBuilder,
	) {
		super();
	}

	match(context: IHttpContext): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
