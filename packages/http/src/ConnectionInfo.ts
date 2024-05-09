import { IPAddress } from '@yohira/base';
import {
	FeatureReferences,
	IFeatureCollection,
} from '@yohira/extensions.features';
import { IConnectionInfo } from '@yohira/http.abstractions';
import { IHttpConnectionFeature } from '@yohira/http.features';

import { HttpConnectionFeature } from './features/HttpConnectionFeature';

class FeatureInterfaces {
	connection: IHttpConnectionFeature | undefined;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Internal/DefaultConnectionInfo.cs,c2383545016a8f77,references
export class ConnectionInfo implements IConnectionInfo {
	private static readonly newHttpConnectionFeature = (
		f: IFeatureCollection,
	): IHttpConnectionFeature => new HttpConnectionFeature();

	private features = new FeatureReferences<FeatureInterfaces>(
		() => new FeatureInterfaces(),
	);

	constructor(features: IFeatureCollection) {
		this.initialize(features);
	}

	private get httpConnectionFeature(): IHttpConnectionFeature {
		return this.features.fetch(
			IHttpConnectionFeature,
			{
				get: () => this.features.cache.connection,
				set: (value) => (this.features.cache.connection = value),
			},
			ConnectionInfo.newHttpConnectionFeature,
		)!;
	}

	get remoteIpAddress(): IPAddress | undefined {
		return this.httpConnectionFeature.remoteIpAddress;
	}
	set remoteIpAddress(value: IPAddress | undefined) {
		this.httpConnectionFeature.remoteIpAddress = value;
	}

	get remotePort(): number {
		return this.httpConnectionFeature.remotePort;
	}
	set remotePort(value: number) {
		this.httpConnectionFeature.remotePort = value;
	}

	get localIpAddress(): IPAddress | undefined {
		return this.httpConnectionFeature.localIpAddress;
	}
	set localIpAddress(value: IPAddress | undefined) {
		this.httpConnectionFeature.localIpAddress = value;
	}

	get localPort(): number {
		return this.httpConnectionFeature.localPort;
	}
	set localPort(value: number) {
		this.httpConnectionFeature.localPort = value;
	}

	initialize(features: IFeatureCollection, revision?: number): void {
		this.features.initialize(features, revision);
	}

	uninitialize(): void {
		this.features = new FeatureReferences<FeatureInterfaces>(
			() => new FeatureInterfaces(),
		);
	}
}
