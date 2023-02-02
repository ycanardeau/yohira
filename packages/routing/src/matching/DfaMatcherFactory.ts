import { IServiceProvider } from '@yohira/base';
import {
	getRequiredService,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';

import { EndpointDataSource } from '../EndpointDataSource';
import { DataSourceDependentMatcher } from './DataSourceDependentMatcher';
import { DfaMatcherBuilder } from './DfaMatcherBuilder';
import { Matcher } from './Matcher';
import { MatcherFactory } from './MatcherFactory';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherFactory.cs,a63b3345343c56b3,references
export class DfaMatcherFactory extends MatcherFactory {
	constructor(
		@inject(Symbol.for('IServiceProvider'))
		private readonly services: IServiceProvider,
	) {
		super();
	}

	createMatcher(dataSource: EndpointDataSource): Matcher {
		// TODO

		return new DataSourceDependentMatcher(
			dataSource,
			// TODO: lifetime,
			() => {
				return getRequiredService<DfaMatcherBuilder>(
					this.services,
					Symbol.for('DfaMatcherBuilder'),
				);
			},
		);
	}
}
