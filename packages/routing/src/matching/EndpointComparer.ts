import { IComparer } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

import { RouteEndpoint } from '../RouteEndpoint';
import { IEndpointComparerPolicy } from './IEndpointComparerPolicy';

function compareTo(x: number, y: number): number {
	if (x < y) {
		return -1;
	} else if (x > y) {
		return 1;
	}
	return 0;
}

class OrderComparer implements IComparer<Endpoint> {
	static readonly instance = new OrderComparer();

	compare(x: Endpoint, y: Endpoint): number {
		const routeEndpointX =
			x instanceof RouteEndpoint ? (x as RouteEndpoint) : undefined;
		const routeEndpointY =
			y instanceof RouteEndpoint ? (y as RouteEndpoint) : undefined;

		if (routeEndpointX !== undefined) {
			if (routeEndpointY !== undefined) {
				return compareTo(routeEndpointX.order, routeEndpointY.order);
			}

			return 1;
		} else if (routeEndpointY !== undefined) {
			return -1;
		}

		return 0;
	}
}

class PrecedenceComparer implements IComparer<Endpoint> {
	static readonly instance = new PrecedenceComparer();

	compare(x: Endpoint, y: Endpoint): number {
		const routeEndpointX =
			x instanceof RouteEndpoint ? (x as RouteEndpoint) : undefined;
		const routeEndpointY =
			y instanceof RouteEndpoint ? (y as RouteEndpoint) : undefined;

		if (routeEndpointX !== undefined) {
			if (routeEndpointY !== undefined) {
				return compareTo(
					routeEndpointX.routePattern.inboundPrecedence,
					routeEndpointY.routePattern.inboundPrecedence,
				);
			}

			return 1;
		} else if (routeEndpointY !== undefined) {
			return -1;
		}

		return 0;
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/EndpointComparer.cs,4307cfe760209866,references
export class EndpointComparer implements IComparer<Endpoint> {
	/* TODO: IEqualityComparer<Endpoint> */

	private readonly comparers: IComparer<Endpoint>[];

	constructor(policies: IEndpointComparerPolicy[]) {
		this.comparers = new Array(2 /* TODO: + policies.length */);
		this.comparers[0] = OrderComparer.instance;
		this.comparers[1] = PrecedenceComparer.instance;
		for (let i = 0; i < policies.length; i++) {
			this.comparers[i + 2] = policies[i].comparer;
		}
	}

	private compareCore(x: Endpoint, y: Endpoint): number {
		for (const comparer of this.comparers) {
			const compare = comparer.compare(x, y);
			if (compare !== 0) {
				return compare;
			}
		}

		return 0;
	}

	private static comparePattern(x: Endpoint, y: Endpoint): number {
		const routeEndpointX =
			x instanceof RouteEndpoint ? (x as RouteEndpoint) : undefined;
		const routeEndpointY =
			y instanceof RouteEndpoint ? (y as RouteEndpoint) : undefined;

		if (routeEndpointX !== undefined) {
			if (routeEndpointY !== undefined) {
				const rawTextX = routeEndpointX.routePattern.rawText;
				const rawTextY = routeEndpointY.routePattern.rawText;

				if (rawTextX === undefined && rawTextY === undefined) {
					return 0;
				}

				if (rawTextX === undefined) {
					return -1;
				}

				if (rawTextY === undefined) {
					return 1;
				}

				return rawTextX
					.toLowerCase()
					.localeCompare(rawTextY.toLowerCase());
			}

			return 1;
		} else if (routeEndpointY !== undefined) {
			return -1;
		}

		return 0;
	}

	compare(x: Endpoint, y: Endpoint): number {
		const compare = this.compareCore(x, y);

		// Since we're sorting, use the route template as a last resort.
		return compare === 0 ? EndpointComparer.comparePattern(x, y) : compare;
	}

	equals(x: Endpoint, y: Endpoint): boolean {
		return this.compareCore(x, y) === 0;
	}
}
