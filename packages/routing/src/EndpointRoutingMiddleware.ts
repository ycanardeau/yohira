import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	ILogger,
	ILoggerT,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import {
	Endpoint,
	IHttpContext,
	IMiddleware,
	RequestDelegate,
	getEndpoint,
} from '@yohira/http.abstractions';

import { CompositeEndpointDataSource } from './CompositeEndpointDataSource';
import { EndpointDataSource } from './EndpointDataSource';
import { IEndpointRouteBuilder } from './IEndpointRouteBuilder';
import { MatcherFactory } from './matching/MatcherFactory';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,bfce4ff333c8a967,references
function logMatchSuccessCore(
	logger: ILogger,
	endpointName: string | undefined,
): void {
	logger.log(LogLevel.Debug, `Request matched endpoint '${endpointName}'`);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,314b5fd335b148a9,references
function logMatchSuccess(logger: ILogger, endpoint: Endpoint): void {
	return logMatchSuccessCore(logger, endpoint.displayName);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,bf81074d263ef2ce,references
function logMatchFailure(logger: ILogger): void {
	logger.log(LogLevel.Debug, `Request did not match any endpoints`);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,67a388aa83cc01ca,references
function logMatchingSkipped(
	logger: ILogger,
	endpointName: string | undefined,
): void {
	logger.log(
		LogLevel.Debug,
		`Endpoint '${endpointName}' already set, skipping route matching.`,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,fd7acd7a68698e72,references
function logMatchSkipped(logger: ILogger, endpoint: Endpoint): void {
	return logMatchingSkipped(logger, endpoint.displayName);
}

// HACK
let endpointRouteBuilder: IEndpointRouteBuilder;
export const endpointRouteBuilderRef = {
	get(): IEndpointRouteBuilder {
		return endpointRouteBuilder;
	},
	set(value: IEndpointRouteBuilder): void {
		if (endpointRouteBuilder !== undefined) {
			throw new Error('Assertion failed.');
		}

		endpointRouteBuilder = value;
	},
};

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointRoutingMiddleware.cs,e91e5febd7b6da29,references
export class EndpointRoutingMiddleware implements IMiddleware {
	private readonly endpointDataSource: EndpointDataSource;

	constructor(
		@inject(Symbol.for('MatcherFactory'))
		private readonly matcherFactory: MatcherFactory,
		@inject(Symbol.for('ILoggerT<EndpointRoutingMiddleware>'))
		private readonly logger: ILoggerT<EndpointRoutingMiddleware>,
	) {
		// HACK
		const endpointRouteBuilder = endpointRouteBuilderRef.get();

		this.endpointDataSource = new CompositeEndpointDataSource(
			endpointRouteBuilder.dataSources,
		);
	}

	private setRoutingAndContinue(
		context: IHttpContext,
		next: RequestDelegate,
	): Promise<void> {
		// If there was no mutation of the endpoint then log failure
		const endpoint = getEndpoint(context);
		if (endpoint === undefined) {
			logMatchFailure(this.logger);
		} else {
			// TODO

			logMatchSuccess(this.logger, endpoint);
		}

		return next(context);
	}

	async invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		// There's already an endpoint, skip matching completely
		const endpoint = getEndpoint(context);
		if (endpoint !== undefined) {
			logMatchSkipped(this.logger, endpoint);
			return next(context);
		}

		const matcher = this.matcherFactory.createMatcher(
			this.endpointDataSource,
		);

		await matcher.match(context);

		await this.setRoutingAndContinue(context, next);
	}
}
