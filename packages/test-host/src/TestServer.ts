import { IServiceProvider } from '@yohira/base';
import { inject } from '@yohira/extensions.dependency-injection.abstractions';
import {
	FeatureCollection,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { IOptions } from '@yohira/extensions.options';
import { ServerAddressesFeature } from '@yohira/hosting';
import { IWebHost } from '@yohira/hosting.abstractions';
import {
	IHttpApp,
	IServer,
	IServerAddressesFeature,
} from '@yohira/hosting.server.abstractions';

import { AppWrapper, AppWrapperBase } from './AppWrapper';
import { TestServerOptions } from './TestServerOptions';

// https://source.dot.net/#Microsoft.AspNetCore.TestHost/TestServer.cs,bd74057f81160be7,references
export class TestServer implements IServer {
	private readonly hostInstance: IWebHost | undefined;
	private disposed = false;
	private app: AppWrapperBase | undefined;

	/**
	 * Gets the collection of server features associated with the test server.
	 */
	readonly features: IFeatureCollection;

	private static createTestFeatureCollection(): FeatureCollection {
		const features = new FeatureCollection();
		features.set(IServerAddressesFeature, new ServerAddressesFeature());
		return features;
	}

	constructor(
		/**
		 * Gets the service provider associated with the test server.
		 */
		@inject(IServiceProvider) private readonly services: IServiceProvider,
		@inject(Symbol.for('IOptions<TestServerOptions>'))
		optionsAccessor: IOptions<TestServerOptions>,
	) {
		this.features = TestServer.createTestFeatureCollection();
	}

	async [Symbol.asyncDispose](): Promise<void> {
		if (!this.disposed) {
			this.disposed = true;
			this.hostInstance?.[Symbol.dispose]();
		}
	}

	start<TContext>(app: IHttpApp<TContext>): Promise<void> {
		this.app = new AppWrapper<TContext>(app, () => {
			if (this.disposed) {
				throw new Error('Cannot access a disposed object.' /* LOC */);
			}
		});

		return Promise.resolve();
	}

	stop(): Promise<void> {
		return Promise.resolve();
	}
}
