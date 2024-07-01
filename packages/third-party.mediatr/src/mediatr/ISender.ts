import { IRequest } from '../mediatr.contracts/IRequest';

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR/ISender.cs#L10
export interface ISender {
	send<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;
}
