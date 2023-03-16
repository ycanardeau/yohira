import {
	IDataProtectionProvider,
	IDataProtector,
} from '@yohira/data-protection.abstractions';
import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';

import { KeyRingBasedDataProtector } from './KeyRingBasedDataProtector';
import { IKeyRingProvider } from './internal/IKeyRingProvider';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/KeyManagement/KeyRingBasedDataProtectionProvider.cs,7373b63f757e0af5,references
export class KeyRingBasedDataProtectionProvider
	implements IDataProtectionProvider
{
	private readonly logger: ILogger;

	constructor(
		private readonly keyRingProvider: IKeyRingProvider,
		loggerFactory: ILoggerFactory,
	) {
		this.logger = loggerFactory.createLogger(
			KeyRingBasedDataProtector.name,
		); // note: for protector (not provider!) type
	}

	createProtector(purpose: string): IDataProtector {
		return new KeyRingBasedDataProtector(
			this.keyRingProvider,
			this.logger,
			undefined,
			purpose,
		);
	}
}
