import {
	IPipelineBehavior,
	RequestHandlerDelegate,
} from '../IPipelineBehavior';

// https://github.com/jbogard/MediatR/blob/e611b1bcc00b10244810abeea2f7c62f155beb5e/src/MediatR/Pipeline/RequestPreProcessorBehavior.cs#L12
/**
 * Behavior for executing all <see cref="IRequestPreProcessor{TRequest}"/> instances before handling a request
 */
export class RequestPreProcessorBehavior<TRequest, TResponse>
	implements IPipelineBehavior<TRequest, TResponse>
{
	handle(
		request: TRequest,
		next: RequestHandlerDelegate<TResponse>,
	): Promise<TResponse> {
		throw new Error('Method not implemented.');
	}
}
