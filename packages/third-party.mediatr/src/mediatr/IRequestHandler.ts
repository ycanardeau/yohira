import { IRequest } from '../mediatr.contracts/IRequest';

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR/IRequestHandler.cs#L11
export interface IRequestHandler<
	TRequest extends IRequest<TResponse>,
	TResponse,
> {
	handle(request: TRequest): Promise<TResponse>;
}
