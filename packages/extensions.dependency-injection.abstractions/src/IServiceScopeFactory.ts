import { IServiceScope } from './IServiceScope';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/IServiceScopeFactory.cs,214994a80197fb23,references
export interface IServiceScopeFactory {
	createScope(): IServiceScope;
}
