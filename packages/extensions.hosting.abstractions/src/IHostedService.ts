// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHostedService.cs,aabac0d326a74262,references
export const IHostedService = Symbol.for('IHostedService');
export interface IHostedService {
	start(/* TODO :cancellationToken */): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
