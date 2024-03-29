import { List, tryGetValue } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { Endpoint } from '@yohira/http.abstractions';
import { Err, Result } from '@yohira/third-party.ts-results';
import { env } from 'node:process';

import { RouteEndpoint } from '../RouteEndpoint';
import { RoutePattern } from '../patterns/RoutePattern';
import { RoutePatternLiteralPart } from '../patterns/RoutePatternLiteralPart';
import { RoutePatternParameterPart } from '../patterns/RoutePatternParameterPart';
import { RoutePatternPathSegment } from '../patterns/RoutePatternPathSegment';
import { computeInboundPrecedenceDigit } from '../template/RoutePrecedence';
import { Candidate } from './Candidate';
import { DfaMatcher } from './DfaMatcher';
import { DfaNode } from './DfaNode';
import { DfaState } from './DfaState';
import { EndpointComparer } from './EndpointComparer';
import { EndpointSelector } from './EndpointSelector';
import { IEndpointComparerPolicy } from './IEndpointComparerPolicy';
import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { INodeBuilderPolicy } from './INodeBuilderPolicy';
import { buildJumpTable } from './JumpTableBuilder';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';
import { MatcherPolicy } from './MatcherPolicy';
import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';

class DfaBuilderWorkerWorkItem {
	constructor(
		readonly endpoint: RouteEndpoint,
		readonly precedenceDigit: number,
		readonly parents: List<DfaNode>,
	) {}
}

function getCurrentSegment(
	endpoint: RouteEndpoint,
	depth: number,
): RoutePatternPathSegment | undefined {
	if (depth < endpoint.routePattern.pathSegments.length) {
		return endpoint.routePattern.pathSegments[depth];
	}

	if (endpoint.routePattern.pathSegments.length === 0) {
		return undefined;
	}

	const lastSegment =
		endpoint.routePattern.pathSegments[
			endpoint.routePattern.pathSegments.length - 1
		];
	if (
		lastSegment.isSimple &&
		lastSegment.parts[0] instanceof RoutePatternParameterPart &&
		lastSegment.parts[0].isCatchAll
	) {
		return lastSegment;
	}

	return undefined;
}

function getPrecedenceDigitAtDepth(
	endpoint: RouteEndpoint,
	depth: number,
): number {
	const segment = getCurrentSegment(endpoint, depth);
	if (segment === undefined) {
		// Treat "no segment" as high priority. it won't effect the algorithm, but we need to define a sort-order.
		return 0;
	}

	return computeInboundPrecedenceDigit(endpoint.routePattern, segment);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherBuilder.cs,c7063a4a4712cc25,references
class DfaBuilderWorker {
	private previousWork: List<DfaBuilderWorkerWorkItem>;
	private workCount = 0;

	constructor(
		private work: List<DfaBuilderWorkerWorkItem>,
		// TODO: private readonly precedenceDigitComparer,
		private readonly includeLabel: boolean, // TODO: private readonly parameterPolicyFactory,
	) {
		this.previousWork = new List<DfaBuilderWorkerWorkItem>();
	}

	private static hasAdditionalRequiredSegments(
		endpoint: RouteEndpoint,
		depth: number,
	): boolean {
		for (
			let i = depth;
			i < endpoint.routePattern.pathSegments.length;
			i++
		) {
			const segment = endpoint.routePattern.pathSegments[i];
			if (!segment.isSimple) {
				// Complex segments always require more processing
				return true;
			}

			const parameterPart =
				segment.parts[0] instanceof RoutePatternParameterPart
					? (segment.parts[0] as RoutePatternParameterPart)
					: undefined;
			if (parameterPart === undefined) {
				// It's a literal
				return true;
			}

			if (
				!parameterPart.isOptional &&
				!parameterPart.isCatchAll &&
				true /* TODO: parameterPart.defaultValue === undefined */
			) {
				return true;
			}
		}

		return false;
	}

	private static addLiteralNode(
		includeLabel: boolean,
		nextParents: List<DfaNode>,
		parent: DfaNode,
		literal: string,
	): void {
		let tryGetValueResult: Result<DfaNode, undefined>;
		let next: DfaNode;
		if (
			parent.literals === undefined ||
			((tryGetValueResult = tryGetValue(parent.literals, literal)) &&
				!tryGetValueResult.ok)
		) {
			next = new DfaNode();
			next.pathDepth = parent.pathDepth + 1;
			next.label = includeLabel
				? parent.label + literal + '/'
				: undefined;
			parent.addLiteral(literal, next);
		} else {
			next = tryGetValueResult.val;
		}

		nextParents.add(next);
	}

	private static tryGetRequiredValue(
		routePattern: RoutePattern,
		parameterPart: RoutePatternParameterPart,
	): Result<unknown, undefined> {
		return new Err(undefined); /* TODO */
	}

	private processSegment(
		endpoint: RouteEndpoint,
		parents: List<DfaNode>,
		nextParents: List<DfaNode>,
		segment: RoutePatternPathSegment,
	): void {
		for (const parent of parents) {
			const part = segment.parts[0];
			const parameterPart =
				part instanceof RoutePatternParameterPart
					? (part as RoutePatternParameterPart)
					: undefined;
			let tryGetRequiredValueResult: Result<unknown, undefined>;
			if (segment.isSimple && part instanceof RoutePatternLiteralPart) {
				DfaBuilderWorker.addLiteralNode(
					this.includeLabel,
					nextParents,
					parent,
					part.content,
				);
			} else if (
				segment.isSimple &&
				parameterPart !== undefined &&
				parameterPart.isCatchAll
			) {
				// A catch all should traverse all literal nodes as well as parameter nodes
				// we don't need to create the parameter node here because of ordering
				// all catchalls will be processed after all parameters.
				if (parent.literals !== undefined) {
					nextParents.addRange(parent.literals.values());
				}
				if (parent.parameters !== undefined) {
					nextParents.add(parent.parameters);
				}

				// We also create a 'catchall' here. We don't do further traversals
				// on the catchall node because only catchalls can end up here. The
				// catchall node allows us to capture an unlimited amount of segments
				// and also to match a zero-length segment, which a parameter node
				// doesn't allow.
				if (parent.catchAll === undefined) {
					parent.catchAll = new DfaNode();
					parent.catchAll.pathDepth = parent.pathDepth + 1;
					parent.catchAll.label = this.includeLabel
						? `${parent.label}{*...}/`
						: undefined;

					// The catchall node just loops.
					parent.catchAll.parameters = parent.catchAll;
					parent.catchAll.catchAll = parent.catchAll;
				}

				parent.catchAll.addMatch(endpoint);
			} else if (
				segment.isSimple &&
				parameterPart !== undefined &&
				(tryGetRequiredValueResult =
					DfaBuilderWorker.tryGetRequiredValue(
						endpoint.routePattern,
						parameterPart,
					)) &&
				tryGetRequiredValueResult.ok
			) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (segment.isSimple && parameterPart !== undefined) {
				if (parent.parameters === undefined) {
					parent.parameters = new DfaNode();
					parent.parameters.pathDepth = parent.pathDepth + 1;
					parent.parameters.label = this.includeLabel
						? `${parent.label}{...}/`
						: undefined;
				}

				if (parent.literals !== undefined) {
					// If the parameter contains constraints, we can be smarter about it and evaluate them while we build the tree.
					// If the literal doesn't match any of the constraints, we can prune the branch.
					// For example, for a parameter in a route {lang:length(2)} and a parent literal "ABC", we can check that "ABC"
					// doesn't meet the parameter constraint (length(2)) when building the tree, and avoid the extra nodes.
					if (false /* TODO */) {
						// We filter out sibling literals that don't match one of the constraints in the segment to avoid adding nodes to the DFA
						// that will never match a route and which will result in a much higher memory usage.
						// TODO
						throw new Error('Method not implemented.');
					} else {
						// This means the current parameter we are evaluating doesn't contain any constraint, so we need to
						// traverse all literal nodes as well as the parameter node.
						nextParents.addRange(parent.literals.values());
					}
				}

				nextParents.add(parent.parameters);
			} else {
				// Complex segment - we treat these are parameters here and do the
				// expensive processing later. We don't want to spend time processing
				// complex segments unless they are the best match, and treating them
				// like parameters in the DFA allows us to do just that.
				if (parent.parameters === undefined) {
					parent.parameters = new DfaNode();
					parent.parameters.pathDepth = parent.pathDepth + 1;
					parent.label = this.includeLabel
						? `${parent.label}{...}/`
						: undefined;
				}

				if (parent.literals !== undefined) {
					// For a complex segment like this, we can evaluate the literals and avoid adding extra nodes to
					// the tree on cases where the literal won't ever be able to match the complex parameter.
					// For example, if we have a complex parameter {a}-{b}.{c?} and a literal "Hello" we can guarantee
					// that it will never be a match.
					// We filter out sibling literals that don't match the complex parameter segment to avoid adding nodes to the DFA
					// that will never match a route and which will result in a much higher memory usage.
					// TODO: this.addParentsMatchingComplexSegment();
				}
				nextParents.add(parent.parameters);
			}
		}
	}

	// Each time we process a level of the DFA we keep a list of work items consisting on the nodes we need to evaluate
	// their precendence and their parent nodes. We sort nodes by precedence on each level, which means that nodes are
	// evaluated in the following order: (literals, constrained parameters/complex segments, parameters, constrainted catch-alls and catch-alls)
	// When we process a stage we build a list of the next set of workitems we need to evaluate. We also keep around the
	// list of workitems from the previous level so that we can reuse all the nested lists while we are evaluating the current level.
	processLevel(depth: number): void {
		// As we process items, collect the next set of items.
		const nextWork = this.previousWork;
		let nextWorkCount = 0;

		// See comments on precedenceDigitComparer
		// TODO: this.work.sort(0, this.workCount, this.precedenceDigitComparer);

		for (const { endpoint, parents } of this.work) {
			if (
				!DfaBuilderWorker.hasAdditionalRequiredSegments(endpoint, depth)
			) {
				for (const parent of parents) {
					parent.addMatch(endpoint);
				}
			}

			// Find the parents of this edge at the current depth
			let nextParents: List<DfaNode> | undefined = undefined;
			if (nextWorkCount < nextWork.count) {
				nextParents = nextWork.get(nextWorkCount).parents;
				nextParents.clear();

				const nextPrecedenceDigit = getPrecedenceDigitAtDepth(
					endpoint,
					depth + 1,
				);
				nextWork.set(
					nextWorkCount,
					new DfaBuilderWorkerWorkItem(
						endpoint,
						nextPrecedenceDigit,
						nextParents,
					),
				);
			} else {
				nextParents = new List<DfaNode>();

				// Add to the next set of work now so the list will be reused
				// even if there are no parents
				const nextPrecedenceDigit = getPrecedenceDigitAtDepth(
					endpoint,
					depth + 1,
				);
				nextWork.add(
					new DfaBuilderWorkerWorkItem(
						endpoint,
						nextPrecedenceDigit,
						nextParents,
					),
				);
			}

			const segment = getCurrentSegment(endpoint, depth);
			if (segment === undefined) {
				continue;
			}

			this.processSegment(endpoint, parents, nextParents, segment);

			if (nextParents.count > 0) {
				nextWorkCount++;
			}
		}

		// Prepare to process the next stage.
		this.previousWork = this.work;
		this.work = nextWork;
		this.workCount = nextWorkCount;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherBuilder.cs,df60c73e02845001,references
export class DfaMatcherBuilder extends MatcherBuilder {
	private readonly endpoints = new List<RouteEndpoint>();

	private readonly endpointSelectorPolicies: IEndpointSelectorPolicy[];
	private readonly nodeBuilders: INodeBuilderPolicy[];
	private readonly comparer: EndpointComparer;

	private stateIndex = 0;

	private static isINodeBuilderPolicy(
		policy: MatcherPolicy | (MatcherPolicy & INodeBuilderPolicy),
	): policy is MatcherPolicy & INodeBuilderPolicy {
		return (
			'endpointSelectorAppliesToEndpoints' in policy && 'apply' in policy
		);
	}

	private static isIEndpointComparerPolicy(
		policy: MatcherPolicy | (MatcherPolicy & IEndpointComparerPolicy),
	): policy is MatcherPolicy & IEndpointComparerPolicy {
		return 'comparer' in policy;
	}

	private static isIEndpointSelectorPolicy(
		policy: MatcherPolicy | (MatcherPolicy & IEndpointSelectorPolicy),
	): policy is MatcherPolicy & IEndpointSelectorPolicy {
		return (
			'nodeBuilderAppliesToEndpoints' in policy &&
			'getEdges' in policy &&
			'buildJumpTable' in policy
		);
	}

	private static extractPolicies(policies: Iterable<MatcherPolicy>): {
		nodeBuilderPolicies: INodeBuilderPolicy[];
		endpointComparerPolicies: IEndpointComparerPolicy[];
		endpointSelectorPolicies: IEndpointSelectorPolicy[];
	} {
		const nodeBuilderPolicies: INodeBuilderPolicy[] = [];
		const endpointComparerPolicies: IEndpointComparerPolicy[] = [];
		const endpointSelectorPolicies: IEndpointSelectorPolicy[] = [];

		for (const policy of policies) {
			if (DfaMatcherBuilder.isINodeBuilderPolicy(policy)) {
				nodeBuilderPolicies.push(policy);
			}

			if (DfaMatcherBuilder.isIEndpointComparerPolicy(policy)) {
				endpointComparerPolicies.push(policy);
			}

			if (DfaMatcherBuilder.isIEndpointSelectorPolicy(policy)) {
				endpointSelectorPolicies.push(policy);
			}
		}

		return {
			nodeBuilderPolicies: nodeBuilderPolicies,
			endpointComparerPolicies: endpointComparerPolicies,
			endpointSelectorPolicies: endpointSelectorPolicies,
		};
	}

	constructor(
		@inject(ILoggerFactory)
		private readonly loggerFactory: ILoggerFactory,
		@inject(Symbol.for('EndpointSelector'))
		private readonly selector: EndpointSelector,
		@inject(Symbol.for('Iterable<MatcherPolicy>'))
		policies: Iterable<MatcherPolicy>,
	) {
		super();

		const {
			nodeBuilderPolicies,
			endpointComparerPolicies,
			endpointSelectorPolicies,
		} = DfaMatcherBuilder.extractPolicies(policies /* TODO: orderBy */);
		this.endpointSelectorPolicies = endpointSelectorPolicies;
		this.nodeBuilders = nodeBuilderPolicies;
		this.comparer = new EndpointComparer(endpointComparerPolicies);
	}

	addEndpoint(endpoint: RouteEndpoint): void {
		this.endpoints.add(endpoint);
	}

	private applyPolicies = (node: DfaNode): void => {
		if (node.matches === undefined || node.matches.length === 0) {
			return;
		}

		// We're done with the precedence based work. Sort the endpoints
		// before applying policies for simplicity in policy-related code.
		node.matches.sort(
			(x, y) => this.comparer.compare(x, y) /* TODO: bind this */,
		);

		// Start with the current node as the root.
		let work = new List<DfaNode>();
		work.add(node);
		let previousWork: List<DfaNode> | undefined = undefined;
		for (const nodeBuilder of this.nodeBuilders) {
			// Build a list of each
			let nextWork: List<DfaNode> | undefined = undefined;
			if (previousWork === undefined) {
				nextWork = new List<DfaNode>();
			} else {
				// Reuse previous collection for the next collection
				previousWork.clear();
				nextWork = previousWork;
			}

			for (const parent of work) {
				if (
					!nodeBuilder.nodeBuilderAppliesToEndpoints(
						parent.matches ?? [],
					)
				) {
					// This node-builder doesn't care about this node, so add it to the list
					// to be processed by the next node-builder.
					nextWork.add(parent);
					continue;
				}

				// This node-builder does apply to this node, so we need to create new nodes for each edge,
				// and then attach them to the parent.
				const edges = nodeBuilder.getEdges(parent.matches ?? []);
				for (const edge of edges) {
					const next = new DfaNode();
					// If parent label is undefined then labels are not being included
					next.label =
						parent.label !== undefined
							? parent.label + ' ' + edge.state.toString()
							: undefined;

					if (edge.endpoints.length > 0) {
						next.addMatches(edge.endpoints);
					}
					nextWork.add(next);

					parent.addPolicyEdge(edge.state, next);
				}

				// Associate the node-builder so we can build a jump table later.
				parent.nodeBuilder = nodeBuilder;

				// The parent no longer has matches, it's not considered a terminal node.
				parent.matches?.splice(
					0,
					parent.matches.length,
				) /* TODO: clear */;
			}

			previousWork = work;
			work = nextWork;
		}
	};

	buildDfaTree(includeLabel = false): DfaNode {
		// Since we're doing a BFS we will process each 'level' of the tree in stages
		// this list will hold the set of items we need to process at the current
		// stage.
		const work =
			new List<DfaBuilderWorkerWorkItem>(/* TODO: this.endpoints.count */);

		const root = new DfaNode();
		root.pathDepth = 0;
		root.label = includeLabel ? '/' : undefined;

		// To prepare for this we need to compute the max depth, as well as
		// a seed list of items to process (entry, root).
		let maxDepth = 0;
		for (const endpoint of this.endpoints) {
			const precedenceDigit = getPrecedenceDigitAtDepth(endpoint, 0);
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
				endpoint.routePattern.pathSegments.length,
			);
		}

		// Sort work at each level by *PRECEDENCE OF THE CURRENT SEGMENT*.
		//
		// We build the tree by doing a BFS over the list of entries. This is important
		// because a 'parameter' node can also traverse the same paths that literal nodes
		// traverse. This means that we need to order the entries first, or else we will
		// miss possible edges in the DFA.
		//
		// We'll sort the matches again later using the *real* comparer once building the
		// precedence part of the DFA is over.
		// TODO: const precedenceDigitComparer = ...

		const dfaWorker = new DfaBuilderWorker(
			work,
			// TODO: precedenceDigitComparer,
			includeLabel,
			// TODO: this.parameterPolicyFactory,
		);

		// Now we process the entries a level at a time.
		for (let depth = 0; depth <= maxDepth; depth++) {
			dfaWorker.processLevel(depth);
		}

		// Build the trees of policy nodes (like HTTP methods). Post-order traversal
		// means that we won't have infinite recursion.
		root.visit(this.applyPolicies);

		return root;
	}

	// internal for tests
	/** @internal */ createCandidate(
		endpoint: Endpoint,
		score: number,
	): Candidate {
		if (endpoint instanceof RouteEndpoint) {
			// TODO

			// TODO: defaults

			for (const segment of endpoint.routePattern.pathSegments) {
				if (!segment.isSimple) {
					continue;
				}

				const parameterPart = segment.parts[0];
				if (!(parameterPart instanceof RoutePatternParameterPart)) {
					continue;
				}

				// TODO
			}

			for (const segment of endpoint.routePattern.pathSegments) {
				if (segment.isSimple) {
					continue;
				}

				// TODO
				throw new Error('Method not implemented.');
			}

			// TODO: parameterPolicies

			return new Candidate(
				endpoint,
				score,
				// TODO: slots,
				// TODO: captures,
				// TODO: catchAll,
				// TODO: complexSegments,
				// TODO: constraints,
			);
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	// Builds an array of candidates for a node, assigns a 'score' for each
	// endpoint.
	/** @internal */ createCandidates(
		endpoints: readonly Endpoint[] | undefined,
	): Candidate[] {
		if (endpoints === undefined || endpoints.length === 0) {
			return [];
		}

		const candidates: Candidate[] = new Array(endpoints.length);

		let score = 0;
		let exemplar = endpoints[0];
		candidates[0] = this.createCandidate(exemplar, score);

		for (let i = 1; i < endpoints.length; i++) {
			const endpoint = endpoints[i];
			if (false /* TODO: !this.comparer.equals(exemplar, endpoint) */) {
				// This endpoint doesn't have the same priority.
				exemplar = endpoint;
				score++;
			}

			candidates[i] = this.createCandidate(endpoint, score);
		}

		return candidates;
	}

	private static buildPolicy(
		exitDestination: number,
		nodeBuilder: INodeBuilderPolicy,
		policyEntries: PolicyJumpTableEdge[] | undefined,
	): PolicyJumpTable | undefined {
		if (policyEntries === undefined) {
			return undefined;
		}

		return nodeBuilder.buildJumpTable(exitDestination, policyEntries);
	}

	private addNode(
		node: DfaNode,
		states: DfaState[],
		exitDestination: number,
	): number {
		const getTransition = (next: DfaNode): number => {
			if (node === next) {
				return this.stateIndex;
			} else {
				this.stateIndex++;
				return this.addNode(next, states, exitDestination);
			}
		};

		node.matches?.sort(
			(x, y) => this.comparer.compare(x, y) /* TODO: bind this */,
		);

		const currentStateIndex = this.stateIndex;

		let currentDefaultDestination = exitDestination;
		let currentExitDestination = exitDestination;
		let pathEntries: { text: string; destination: number }[] | undefined =
			undefined;
		let policyEntries: PolicyJumpTableEdge[] | undefined = undefined;

		if (node.literals !== undefined) {
			pathEntries = new Array(node.literals.size);

			let index = 0;
			for (const [key, value] of node.literals) {
				const transition = getTransition(value);
				pathEntries[index++] = { text: key, destination: transition };
			}
		}

		if (
			node.parameters !== undefined &&
			node.catchAll !== undefined &&
			node.parameters === node.catchAll
		) {
			// This node has a single transition to but it should accept zero-width segments
			// this can happen when a node only has catchall parameters.
			currentExitDestination = currentDefaultDestination = getTransition(
				node.parameters,
			);
		} else if (
			node.parameters !== undefined &&
			node.catchAll !== undefined
		) {
			// This node has a separate transition for zero-width segments
			// this can happen when a node has both parameters and catchall parameters.
			currentDefaultDestination = getTransition(node.parameters);
			currentExitDestination = getTransition(node.catchAll);
		} else if (node.parameters !== undefined) {
			// This node has parameters but no catchall.
			currentDefaultDestination = getTransition(node.parameters);
		} else if (node.catchAll !== undefined) {
			// This node has a catchall but no parameters
			currentExitDestination = currentDefaultDestination = getTransition(
				node.catchAll,
			);
		}

		if (node.policyEdges !== undefined && node.policyEdges.size > 0) {
			policyEntries = new Array(node.policyEdges.size);

			let index = 0;
			for (const [key, value] of node.policyEdges) {
				policyEntries[index++] = new PolicyJumpTableEdge(
					key,
					getTransition(value),
				);
			}
		}

		const candidates = this.createCandidates(node.matches);

		let endpointSelectorPolicies: IEndpointSelectorPolicy[] | undefined =
			undefined;
		if (node.matches && node.matches.length > 0) {
			for (const endpointSelectorPolicy of this
				.endpointSelectorPolicies) {
				if (
					endpointSelectorPolicy.endpointSelectorAppliesToEndpoints(
						node.matches,
					)
				) {
					if (endpointSelectorPolicies === undefined) {
						endpointSelectorPolicies = [];
					}

					endpointSelectorPolicies.push(endpointSelectorPolicy);
				}
			}
		}

		states[currentStateIndex] = new DfaState(
			candidates,
			endpointSelectorPolicies ?? [],
			buildJumpTable(
				currentDefaultDestination,
				currentExitDestination,
				pathEntries,
			),
			// Use the final exit destination when building the policy state.
			// We don't want to use either of the current destinations because they refer routing states,
			// and a policy state should never transition back to a routing state.
			DfaMatcherBuilder.buildPolicy(
				exitDestination,
				node.nodeBuilder,
				policyEntries,
			),
		);

		return currentStateIndex;
	}

	build(): Matcher {
		const includeLabel = env.NODE_ENV === 'development' ? true : false;

		const root = this.buildDfaTree(includeLabel);

		// State count is the number of nodes plus an exit state
		let stateCount = 1;
		let maxSegmentCount = 0;
		root.visit((node) => {
			stateCount++;
			maxSegmentCount = Math.max(maxSegmentCount, node.pathDepth);
		});
		this.stateIndex = 0;

		// The max segment count is the maximum path-node-depth +1. We need
		// the +1 to capture any additional content after the 'last' segment.
		maxSegmentCount++;

		const states: DfaState[] = new Array(stateCount);
		const exitDestination = stateCount - 1;
		this.addNode(root, states, exitDestination);

		// The root state only has a jump table.
		states[exitDestination] = new DfaState(
			[],
			[],
			buildJumpTable(exitDestination, exitDestination, undefined),
			undefined,
		);

		return new DfaMatcher(
			this.loggerFactory.createLogger(DfaMatcher.name),
			this.selector,
			states,
			maxSegmentCount,
		);
	}
}
