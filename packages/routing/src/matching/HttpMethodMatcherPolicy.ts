import {
	CaseInsensitiveMap,
	CaseInsensitiveSet,
	IEquatable,
	getStringHashCode,
	tryGetValue,
	typedef,
} from '@yohira/base';
import { HttpContext } from '@yohira/http';
import {
	Endpoint,
	HttpMethods,
	HttpMethodsEquals,
} from '@yohira/http.abstractions';
import { Result } from '@yohira/third-party.ts-results';

import { IHttpMethodMetadata } from '../IHttpMethodMetadata';
import { CandidateSet } from './CandidateSet';
import { HttpMethodDictionaryPolicyJumpTable } from './HttpMethodDictionaryPolicyJumpTable';
import { HttpMethodSingleEntryPolicyJumpTable } from './HttpMethodSingleEntryPolicyJumpTable';
import { IEndpointSelectorPolicy } from './IEndpointSelectorPolicy';
import { INodeBuilderPolicy } from './INodeBuilderPolicy';
import { MatcherPolicy } from './MatcherPolicy';
import { PolicyJumpTable } from './PolicyJumpTable';
import { PolicyJumpTableEdge } from './PolicyJumpTableEdge';
import { PolicyNodeEdge } from './PolicyNodeEdge';

export const preflightHttpMethod = HttpMethods.Options;

export const http405EndpointDisplayName = '405 HTTP Method Not Supported';

const anyMethod = '*';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodMatcherPolicy.cs,c75c4b24f2133482,references
class EdgeKey implements IEquatable<EdgeKey> {
	constructor(
		readonly httpMethod: string,
		readonly isCorsPreflightRequest: boolean,
	) {}

	static equals(
		left: EdgeKey | undefined,
		right: EdgeKey | undefined,
	): boolean {
		if (left === undefined && right === undefined) {
			return true;
		}

		if (left === undefined || right === undefined) {
			return false;
		}

		return (
			left.isCorsPreflightRequest === right.isCorsPreflightRequest &&
			HttpMethodsEquals(left.httpMethod, right.httpMethod)
		);
	}

	equals(other: EdgeKey | undefined): boolean {
		return EdgeKey.equals(this, other);
	}

	getHashCode(): number {
		return (
			((this.httpMethod ? getStringHashCode(this.httpMethod) : 23) *
				397) ^
			(this.isCorsPreflightRequest ? 1 : 0)
		);
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodMatcherPolicy.cs,e1986934a0392a00,references
@typedef({
	extends: Symbol.for('MatcherPolicy'),
	implements: [INodeBuilderPolicy, IEndpointSelectorPolicy],
})
export class HttpMethodMatcherPolicy
	extends MatcherPolicy
	implements INodeBuilderPolicy, IEndpointSelectorPolicy
{
	get order(): number {
		return -1000;
	}

	private static nodeBuilderAppliesToEndpointsCore(
		endpoints: readonly Endpoint[],
	): boolean {
		for (const endpoint of endpoints) {
			const httpMethodMetadata =
				endpoint.metadata.getMetadata<IHttpMethodMetadata>(
					IHttpMethodMetadata,
				);
			if (
				httpMethodMetadata !== undefined &&
				httpMethodMetadata.httpMethods.length > 0
			) {
				return true;
			}
		}

		return false;
	}

	nodeBuilderAppliesToEndpoints(endpoints: readonly Endpoint[]): boolean {
		if (MatcherPolicy.containsDynamicEndpoints(endpoints)) {
			return false;
		}

		return HttpMethodMatcherPolicy.nodeBuilderAppliesToEndpointsCore(
			endpoints,
		);
	}

	endpointSelectorAppliesToEndpoints(
		endpoints: readonly Endpoint[],
	): boolean {
		// When the node contains dynamic endpoints we can't make any assumptions.
		return MatcherPolicy.containsDynamicEndpoints(endpoints);
	}

	apply(httpContext: HttpContext, candidates: CandidateSet): Promise<void> {
		let needs405Endpoint: boolean | undefined = undefined;
		let methods: CaseInsensitiveSet | undefined = new CaseInsensitiveSet();

		for (let i = 0; i < candidates.count; i++) {
			const metadata = candidates
				.get(i)
				.get()
				.endpoint?.metadata.getMetadata<IHttpMethodMetadata>(
					IHttpMethodMetadata,
				);
			if (metadata === undefined || metadata.httpMethods.length === 0) {
				// Can match any method.
				needs405Endpoint = false;
				continue;
			}

			// Saw a valid endpoint.
			needs405Endpoint = needs405Endpoint ?? true;

			if (!candidates.isValidCandidate(i)) {
				continue;
			}

			const httpMethod = httpContext.request.method;
			// TODO: const headers = httpContext.request.headers;
			if (
				metadata.acceptCorsPreflight &&
				HttpMethodsEquals(httpMethod, preflightHttpMethod)
				// TODO
			) {
				needs405Endpoint = false; // We don't return a 405 for a CORS preflight request when the endpoints accept CORS preflight.
				// TODO: httpMethod =
			}

			let matched = false;
			for (let j = 0; j < metadata.httpMethods.length; j++) {
				const candidateMethod = metadata.httpMethods[j];
				if (!HttpMethodsEquals(httpMethod, candidateMethod)) {
					methods = methods ?? new CaseInsensitiveSet();
					methods.add(candidateMethod);
					continue;
				}

				matched = true;
				needs405Endpoint = false;
				break;
			}

			if (!matched) {
				candidates.setValidity(i, false);
			}
		}

		if (needs405Endpoint === true) {
			// We saw some endpoints coming in, and we eliminated them all.
			// TODO
			throw new Error('Method not implemented.');
		}

		return Promise.resolve();
	}

	private static containsHttpMethod(
		httpMethods: string[],
		httpMethod: string,
	): boolean {
		for (const method of httpMethods) {
			if (HttpMethodsEquals(method, httpMethod)) {
				return true;
			}
		}

		return false;
	}

	getEdges(endpoints: readonly Endpoint[]): readonly PolicyNodeEdge[] {
		function getHttpMethods(e: Endpoint): {
			httpMethods: readonly string[];
			acceptCorsPreflight: boolean;
		} {
			const metadata =
				e.metadata.getMetadata<IHttpMethodMetadata>(
					IHttpMethodMetadata,
				);
			return metadata === undefined
				? {
						httpMethods: [],
						acceptCorsPreflight: false,
				  }
				: {
						httpMethods: metadata.httpMethods,
						acceptCorsPreflight: metadata.acceptCorsPreflight,
				  };
		}

		const allHttpMethods: string[] = [];
		const edges = new Map<
			number /* TODO: EdgeKey */,
			{ key: EdgeKey /* TODO: remove */; endpoints: Endpoint[] }
		>();
		for (const endpoint of endpoints) {
			const getHttpMethodsResult = getHttpMethods(endpoint);
			let httpMethods = getHttpMethodsResult.httpMethods;
			const acceptCorsPreflight =
				getHttpMethodsResult.acceptCorsPreflight;

			// If the action doesn't list HTTP methods then it supports all methods.
			// In this phase we use a sentinel value to represent the *other* HTTP method
			// a state that represents any HTTP method that doesn't have a match.
			if (httpMethods.length === 0) {
				httpMethods = [anyMethod];
			}

			for (const httpMethod of httpMethods) {
				// An endpoint that allows CORS reqests will match both CORS and non-CORS
				// so we model it as both.
				let key = new EdgeKey(httpMethod, acceptCorsPreflight);
				if (!edges.has(key.getHashCode())) {
					edges.set(key.getHashCode(), { key: key, endpoints: [] });
				}

				// An endpoint that allows CORS reqests will match both CORS and non-CORS
				// so we model it as both.
				if (acceptCorsPreflight) {
					key = new EdgeKey(httpMethod, false);
					if (!edges.has(key.getHashCode())) {
						edges.set(key.getHashCode(), {
							key: key,
							endpoints: [],
						});
					}
				}

				// Also if it's not the *any* method key, then track it.
				if (anyMethod.toLowerCase() !== httpMethod.toLowerCase()) {
					if (
						!HttpMethodMatcherPolicy.containsHttpMethod(
							allHttpMethods,
							httpMethod,
						)
					) {
						allHttpMethods.push(httpMethod);
					}
				}
			}
		}

		// TODO: allHttpMethods.sort(/* TODO */);

		// Now in a second loop, add endpoints to these lists. We've enumerated all of
		// the states, so we want to see which states this endpoint matches.
		for (const endpoint of endpoints) {
			const { httpMethods, acceptCorsPreflight } =
				getHttpMethods(endpoint);

			if (httpMethods.length === 0) {
				// OK this means that this endpoint matches *all* HTTP methods.
				// So, loop and add it to all states.
				for (const [, value] of edges) {
					if (
						acceptCorsPreflight ||
						!value.key.isCorsPreflightRequest
					) {
						value.endpoints.push(endpoint);
					}
				}
			} else {
				// OK this endpoint matches specific methods.
				for (const httpMethod of httpMethods) {
					let key = new EdgeKey(httpMethod, acceptCorsPreflight);

					const edge = edges.get(key.getHashCode());
					if (edge === undefined) {
						throw new Error('Assertion failed.');
					}

					edge.endpoints.push(endpoint);

					// An endpoint that allows CORS reqests will match both CORS and non-CORS
					// so we model it as both.
					if (acceptCorsPreflight) {
						key = new EdgeKey(httpMethod, false);
						edge.endpoints.push(endpoint);
					}
				}
			}
		}

		// Adds a very low priority endpoint that will reject the request with
		// a 405 if nothing else can handle this verb. This is only done if
		// no other actions exist that handle the 'all verbs'.
		//
		// The rationale for this is that we want to report a 405 if none of
		// the supported methods match, but we don't want to report a 405 in a
		// case where an application defines an endpoint that handles all verbs, but
		// a constraint rejects the request, or a complex segment fails to parse. We
		// consider a case like that a 'user input validation' failure  rather than
		// a semantic violation of HTTP.
		//
		// This will make 405 much more likely in API-focused applications, and somewhat
		// unlikely in a traditional MVC application. That's good.
		//
		// We don't bother returning a 405 when the CORS preflight method doesn't exist.
		// The developer calling the API will see it as a CORS error, which is fine because
		// there isn't an endpoint to check for a CORS policy.
		// TODO

		const policyNodeEdges: PolicyNodeEdge[] = new Array(edges.size);
		let index = 0;
		for (const [, value] of edges) {
			policyNodeEdges[index++] = new PolicyNodeEdge(
				value.key,
				value.endpoints,
			);
		}

		return policyNodeEdges;
	}

	buildJumpTable(
		exitDestination: number,
		edges: readonly PolicyJumpTableEdge[],
	): PolicyJumpTable {
		let destinations: CaseInsensitiveMap<number> | undefined = undefined;
		let corsPreflightDestinations: CaseInsensitiveMap<number> | undefined =
			undefined;
		for (const edge of edges) {
			const key = edge.state as EdgeKey;
			if (key.isCorsPreflightRequest) {
				if (corsPreflightDestinations === undefined) {
					corsPreflightDestinations = new CaseInsensitiveMap();
				}

				corsPreflightDestinations.set(key.httpMethod, edge.destination);
			} else {
				if (destinations === undefined) {
					destinations = new CaseInsensitiveMap();
				}

				destinations.set(key.httpMethod, edge.destination);
			}
		}

		let tryGetValueResult: Result<number, undefined>;

		let corsPreflightExitDestination = exitDestination;
		if (
			corsPreflightDestinations !== undefined &&
			(tryGetValueResult = tryGetValue(
				corsPreflightDestinations,
				anyMethod,
			)) &&
			tryGetValueResult.ok
		) {
			// If we have endpoints that match any HTTP method, use that as the exit.
			corsPreflightExitDestination = tryGetValueResult.val;
			corsPreflightDestinations.delete(anyMethod);
		}

		if (
			destinations !== undefined &&
			(tryGetValueResult = tryGetValue(destinations, anyMethod)) &&
			tryGetValueResult.ok
		) {
			// If we have endpoints that match any HTTP method, use that as the exit.
			exitDestination = tryGetValueResult.val;
			destinations.delete(anyMethod);
		}

		if (destinations?.size === 1) {
			// If there is only a single valid HTTP method then use an optimized jump table.
			// It avoids unnecessary dictionary lookups with the method name.
			const [method, destination] = Array.from(destinations)[0];
			let supportsCorsPreflight = false;
			let corsPreflightDestination = 0;

			if (
				corsPreflightDestinations !== undefined &&
				corsPreflightDestinations.size > 0
			) {
				supportsCorsPreflight = true;
				const [, value] = Array.from(corsPreflightDestinations)[0];
				corsPreflightDestination = value;
			}

			return new HttpMethodSingleEntryPolicyJumpTable(
				exitDestination,
				method,
				destination,
				supportsCorsPreflight,
				corsPreflightExitDestination,
				corsPreflightDestination,
			);
		} else {
			return new HttpMethodDictionaryPolicyJumpTable(
				exitDestination,
				destinations,
				corsPreflightExitDestination,
				corsPreflightDestinations,
			);
		}
	}
}
