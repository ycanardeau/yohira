import { List, Type } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { env } from 'node:process';

import { RouteEndpoint } from '../RouteEndpoint';
import { DfaMatcher } from './DfaMatcher';
import { DfaNode } from './DfaNode';
import { DfaState } from './DfaState';
import { EndpointSelector } from './EndpointSelector';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';

class DfaBuilderWorkerWorkItem {
	constructor(
		readonly endpoint: RouteEndpoint,
		readonly precedenceDigit: number,
		readonly parents: List<DfaNode>,
	) {}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherBuilder.cs,df60c73e02845001,references
export class DfaMatcherBuilder extends MatcherBuilder {
	private readonly endpoints = new List<RouteEndpoint>();

	constructor(
		@inject(Type.from('ILoggerFactory'))
		private readonly loggerFactory: ILoggerFactory,
		@inject(Type.from('EndpointSelector'))
		private readonly selector: EndpointSelector,
	) {
		super();
	}

	private static getPrecedenceDigitAtDepth(
		endpoint: RouteEndpoint,
		depth: number,
	): number {
		// TODO
		throw new Error('Method not implemented.');
	}

	private applyPolicies = (node: DfaNode): void => {
		if (node.matches === undefined || node.matches.count === 0) {
			return;
		}

		// TODO
		throw new Error('Method not implemented.');
	};

	buildDfaTree(includeLabel: boolean): DfaNode {
		const work =
			new List<DfaBuilderWorkerWorkItem>(/* TODO: this.endpoints.count */);

		const root = new DfaNode();
		root.pathDepth = 0;
		root.label = includeLabel ? '/' : undefined;

		let maxDepth = 0;
		for (let i = 0; i < this.endpoints.count; i++) {
			const endpoint = this.endpoints.get(i);
			const precedenceDigit = DfaMatcherBuilder.getPrecedenceDigitAtDepth(
				endpoint,
				0,
			);
			const parents = new List<DfaNode>();
			parents.add(root);
			work.add(
				new DfaBuilderWorkerWorkItem(
					endpoint,
					precedenceDigit,
					parents,
				),
			);
			maxDepth = Math.max(
				maxDepth,
				endpoint.routePattern.pathSegments.count,
			);
		}

		// TODO

		root.visit(this.applyPolicies);

		return root;
	}

	build(): Matcher {
		const includeLabel = env.NODE_ENV === 'development' ? true : false;

		const root = this.buildDfaTree(includeLabel);

		let stateCount = 1;
		let maxSegmentCount = 0;
		root.visit((node) => {
			stateCount++;
			maxSegmentCount = Math.max(maxSegmentCount, node.pathDepth);
		});
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
