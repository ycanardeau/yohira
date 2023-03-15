import { IDistributedCache } from '@yohira/extensions.caching.abstractions';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import { ILoggerFactory } from '@yohira/extensions.logging.abstractions';
import { ISession } from '@yohira/http.features';

import { DistributedSession } from './DistributedSession';
import { ISessionStore } from './ISessionStore';

// https://source.dot.net/#Microsoft.AspNetCore.Session/DistributedSessionStore.cs,79f0aed9699accf4,references
export class DistributedSessionStore implements ISessionStore {
	constructor(
		@inject(IDistributedCache) private readonly cache: IDistributedCache,
		@inject(ILoggerFactory) private readonly loggerFactory: ILoggerFactory,
	) {}

	create(
		sessionKey: string,
		// TODO: idleTimeout,
		// TODO: ioTimeout,
		tryEstablishSession: () => boolean,
		isNewSessionKey: boolean,
	): ISession {
		if (!sessionKey) {
			throw new Error(
				'Argument cannot be null or empty string.' /* LOC */,
			);
		}

		return new DistributedSession(
			this.cache,
			sessionKey,
			// TODO: idleTimeout,
			// TODO: ioTimeout,
			tryEstablishSession,
			this.loggerFactory,
			isNewSessionKey,
		);
	}
}
