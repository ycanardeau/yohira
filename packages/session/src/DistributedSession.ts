import { IDistributedCache } from '@yohira/extensions.caching.abstractions';
import {
	ILogger,
	ILoggerFactory,
} from '@yohira/extensions.logging.abstractions';
import { ISession } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Session/DistributedSession.cs,eb1af54dc0729609,references
export class DistributedSession implements ISession {
	private readonly logger: ILogger;
	private isModified = false;

	constructor(
		private readonly cache: IDistributedCache,
		private readonly sessionKey: string,
		// TODO: private readonly idleTimeout,
		// TODO: private readonly ioTimeout,
		private readonly tryEstablishSession: () => boolean,
		loggerFactory: ILoggerFactory,
		private readonly isNewSessionKey: boolean,
	) {
		if (!sessionKey) {
			throw new Error(
				'Argument cannot be null or empty string.' /* LOC */,
			);
		}

		this.logger = loggerFactory.createLogger(DistributedSession.name);
	}

	async commit(/* TODO: cancellationToken */): Promise<void> {
		// TODO: timeout
		// TODO: cts =
		if (this.isModified) {
			// TODO
			throw new Error('Method not implemented.');
		} else {
			try {
				await this.cache.refresh(
					this.sessionKey /* TODO: , cts.token */,
				);
			} catch (error) {
				// TODO
				throw error;
			}
		}
	}
}
