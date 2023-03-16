import { IKeyRing } from './IKeyRing';

export const IKeyRingProvider = Symbol.for('IKeyRingProvider');
// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/Internal/IKeyRingProvider.cs,6581f812d86bf2f0,references
/**
 * This API supports infrastructure and is not intended to be used
 * directly from your code. This API may change or be removed in future releases.
 */
export interface IKeyRingProvider {
	/**
	 * This API supports infrastructure and is not intended to be used
	 * directly from your code. This API may change or be removed in future releases.
	 */
	getCurrentKeyRing(): IKeyRing;
}
