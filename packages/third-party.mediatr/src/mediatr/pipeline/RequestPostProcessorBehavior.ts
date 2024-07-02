import {
	IPipelineBehavior,
	RequestHandlerDelegate,
} from '../IPipelineBehavior';

// https://github.com/jbogard/MediatR/blob/e611b1bcc00b10244810abeea2f7c62f155beb5e/src/MediatR/Pipeline/RequestPostProcessorBehavior.cs#L12
/**
 * Behavior for executing all <see cref="IRequestPostProcessor{TRequest,TResponse}"/> instances after handling the request
 */
export class RequestPostProcessorBehavior<TRequest, TResponse>
	implements IPipelineBehavior<TRequest, TResponse>
{
	handle(
		request: TRequest,
		next: RequestHandlerDelegate<TResponse>,
	): Promise<TResponse> {
		throw new Error('Method not implemented.');
	}
}
