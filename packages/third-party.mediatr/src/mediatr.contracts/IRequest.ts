// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR.Contracts/IRequest.cs#L17
export interface IBaseRequest {}

// https://github.com/jbogard/MediatR/blob/761fb0b1b420f5a8c2cb4a751617dce7ab9c3fe3/src/MediatR.Contracts/IRequest.cs#L12
export interface IRequest<TResponse> extends IBaseRequest {}
