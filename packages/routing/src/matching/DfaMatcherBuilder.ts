import { Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';

import { DfaMatcher } from './DfaMatcher';
import { DfaState } from './DfaState';
import { EndpointSelector } from './EndpointSelector';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherBuilder.cs,df60c73e02845001,references
export class DfaMatcherBuilder extends MatcherBuilder {
	constructor(
		@inject(Type.from('ILoggerFactory'))
		private readonly loggerFactory: ILoggerFactory,
		@inject(Type.from('EndpointSelector'))
		private readonly selector: EndpointSelector,
	) {
		super();
	}

	build(): Matcher {
		// TODO

		const stateCount = 1;
		let maxSegmentCount = 0;
		// TODO

		maxSegmentCount++;

		const states: DfaState[] = []; /* TODO */
		// TODO

		// TODO

		return new DfaMatcher(
			this.loggerFactory.createLogger(DfaMatcher.name),
			this.selector,
			states,
			maxSegmentCount,
		);
	}
}
