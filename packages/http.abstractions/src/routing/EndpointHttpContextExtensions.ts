import { IHttpContext } from '../IHttpContext';
import { Endpoint } from '../routing/Endpoint';
import { IEndpointFeature } from './IEndpointFeature';

class EndpointFeature implements IEndpointFeature {
	endpoint?: Endpoint;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointHttpContextExtensions.cs,ea7f441e3031e7ce,references
/**
 * Extension method for getting the {@link Endpoint} for the current request.
 * @param context The {@link HttpContext} context.
 * @returns The {@link Endpoint}.
 */
export function getEndpoint(context: IHttpContext): Endpoint | undefined {
	return context.features.get<IEndpointFeature>(IEndpointFeature)?.endpoint;
}

/**
 * Extension method for setting the {@link Endpoint} for the current request.
 * @param context The {@link HttpContext} context.
 * @param endpoint The {@link Endpoint}.
 */
export function setEndpoint(
	context: IHttpContext,
	endpoint: Endpoint | undefined,
): void {
	let feature = context.features.get<IEndpointFeature>(IEndpointFeature);

	if (endpoint !== undefined) {
		if (feature === undefined) {
			feature = new EndpointFeature();
			context.features.set(IEndpointFeature, feature);
		}

		feature.endpoint = endpoint;
	} else {
		if (feature === undefined) {
			// No endpoint to set and no feature on context. Do nothing
			return;
		}

		feature.endpoint = undefined;
	}
}
