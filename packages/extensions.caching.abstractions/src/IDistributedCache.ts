export const IDistributedCache = Symbol.for('IDistributedCache');
// https://source.dot.net/#Microsoft.Extensions.Caching.Abstractions/IDistributedCache.cs,bc3632241f1561ed,references
export interface IDistributedCache {
	refreshSync(key: string): void;
	refresh(key: string /* TODO: , token: CancellationToken */): Promise<void>;
}
