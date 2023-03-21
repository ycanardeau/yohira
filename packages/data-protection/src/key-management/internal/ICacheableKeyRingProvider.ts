import { CacheableKeyRing } from './CacheableKeyRing';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/ICacheableKeyRingProvider.cs,4a2e29ec04b3ddbc,references
export interface ICacheableKeyRingProvider {
	getCacheableKeyRing(now: number): CacheableKeyRing;
}
