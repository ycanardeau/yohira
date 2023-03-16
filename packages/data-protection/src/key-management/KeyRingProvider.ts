import { IKeyRing } from './internal/IKeyRing';
import { IKeyRingProvider } from './internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingProvider.cs,7292fb503792df39,references
export class KeyRingProvider implements IKeyRingProvider {
	getCurrentKeyRing(): IKeyRing {
		// TODO
		throw new Error('Method not implemented.');
	}
}
