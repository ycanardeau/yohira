export type RequestHandlerDelegate<TResponse> = () => Promise<TResponse>;

// https://github.com/jbogard/MediatR/blob/e611b1bcc00b10244810abeea2f7c62f155beb5e/src/MediatR/IPipelineBehavior.cs#L20
export interface IPipelineBehavior<TRequest, TResponse> {
	handle(
		request: TRequest,
		next: RequestHandlerDelegate<TResponse>,
	): Promise<TResponse>;
}
