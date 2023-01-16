import { Type } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Features/IFeatureCollection.cs,a1176f964a1c46f8,references
export interface IFeatureCollection {
	get<T>(key: Type): T | undefined;
	set<T>(key: Type, instance: T | undefined): void;
}
