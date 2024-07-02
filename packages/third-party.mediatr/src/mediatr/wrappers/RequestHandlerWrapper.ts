import { Ctor, IServiceProvider } from '@yohira/base';
import {
	getRequiredService,
	getServices,
} from '@yohira/extensions.dependency-injection.abstractions';

import { IRequest } from '../../mediatr.contracts/IRequest';
import {
	IPipelineBehavior,
	RequestHandlerDelegate,
} from '../IPipelineBehavior';
import { IRequestHandler } from '../IRequestHandler';

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR/Wrappers/RequestHandlerWrapper.cs#L9
export abstract class RequestHandlerBase {
	abstract handle(
		request: object,
		serviceProvider: IServiceProvider,
	): Promise<any /* TODO */>;
}

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR/Wrappers/RequestHandlerWrapper.cs#L15
export abstract class RequestHandlerWrapper<
	TResponse,
> extends RequestHandlerBase {
	abstract handle(
		request: IRequest<TResponse>,
		serviceProvider: IServiceProvider,
	): Promise<TResponse>;
}

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR/Wrappers/RequestHandlerWrapper.cs#L27
export class RequestHandlerWrapperImpl<
	TRequest extends IRequest<TResponse>,
	TResponse,
> extends RequestHandlerWrapper<TResponse> {
	constructor(private readonly requestCtor: Ctor<TRequest>) {
		super();
	}

	handle(
		request: IRequest<TResponse>,
		serviceProvider: IServiceProvider,
	): Promise<TResponse> {
		const handler = (): Promise<TResponse> =>
			getRequiredService<IRequestHandler<TRequest, TResponse>>(
				serviceProvider,
				Symbol.for(`IRequestHandler<${this.requestCtor.name}>`),
			).handle(request as TRequest);

		return getServices<IPipelineBehavior<TRequest, TResponse>>(
			serviceProvider,
			Symbol.for(`IPipelineBehavior<${this.requestCtor.name}>`),
		)
			.reverse()
			.reduce(
				(next, pipeline) => () =>
					pipeline.handle(request as TRequest, next),
				handler as RequestHandlerDelegate<TResponse>,
			)();
	}
}
