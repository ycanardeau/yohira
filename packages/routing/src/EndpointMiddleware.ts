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

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointMiddleware.cs,68ea7a48f750a4aa,references
function logExecutingEndpoint(logger: ILogger, endpointName: Endpoint): void {
	logger.log(LogLevel.Information, `Executing endpoint '${endpointName}'`);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointMiddleware.cs,4aae084731f4a1a8,references
function logExecutedEndpoint(logger: ILogger, endpointName: Endpoint): void {
	logger.log(LogLevel.Information, `Executed endpoint '${endpointName}'`);
}

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointMiddleware.cs,77ef7553d52a2cd5,references
export class EndpointMiddleware implements IMiddleware {
	private readonly logger: ILogger;

	constructor(
		@inject(Symbol.for('ILoggerT<EndpointMiddleware>'))
		logger: ILoggerT<EndpointMiddleware>,
		// TODO: routeOptions
	) {
		this.logger = logger;
	}

	async invoke(context: IHttpContext, next: RequestDelegate): Promise<void> {
		const endpoint = getEndpoint(context);
		if (endpoint !== undefined) {
			// TODO

			if (endpoint.requestDelegate !== undefined) {
				logExecutingEndpoint(this.logger, endpoint);

				try {
					await endpoint.requestDelegate(context);
				} finally {
					logExecutedEndpoint(this.logger, endpoint);
				}

				return;
			}
		}

		await next(context);
	}
}
