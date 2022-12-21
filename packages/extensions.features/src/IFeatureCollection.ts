import { interfaces } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Features/IFeatureCollection.cs,a1176f964a1c46f8,references
export interface IFeatureCollection {
	get<T>(key: interfaces.ServiceIdentifier<T>): T | undefined;
	set<T>(key: interfaces.ServiceIdentifier<T>, instance: T | undefined): void;
}
