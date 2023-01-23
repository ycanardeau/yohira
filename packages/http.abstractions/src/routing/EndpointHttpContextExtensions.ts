import { Type } from '@yohira/base';

import { IHttpContext } from '../IHttpContext';
import { Endpoint } from '../routing/Endpoint';
import { IEndpointFeature } from './IEndpointFeature';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/EndpointHttpContextExtensions.cs,ea7f441e3031e7ce,references
/**
 * Extension method for getting the {@link Endpoint} for the current request.
 * @param context The {@link HttpContext} context.
 * @returns The {@link Endpoint}.
 */
export function getEndpoint(context: IHttpContext): Endpoint | undefined {
	return context.features.get<IEndpointFeature>(Type.from('IEndpointFeature'))
		?.endpoint;
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
	const feature = context.features.get<IEndpointFeature>(
		Type.from('IEndpointFeature'),
	);

	if (endpoint !== undefined) {
		if (feature === undefined) {
			/* TODO: feature = new EndpointFeature();
			context.features.set(feature); */
			throw new Error('Method not implemented.');
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
