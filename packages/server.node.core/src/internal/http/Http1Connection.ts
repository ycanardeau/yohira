import { Type } from '@yohira/base';
import { IFeatureCollection } from '@yohira/extensions.features';
import { IHttpApp } from '@yohira/hosting.server.abstractions';
import { Endpoint, IEndpointFeature } from '@yohira/http.abstractions';
import {
	IHttpRequestFeature,
	IServiceProvidersFeature,
} from '@yohira/http.features';
import { IncomingMessage, ServerResponse } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Http/Http1Connection.cs,9a7555a5b425c5dc,references
export class Http1Connection
	implements IFeatureCollection, IHttpRequestFeature, IEndpointFeature
{
	private currentIHttpRequestFeature?: IHttpRequestFeature;
	private currentIEndpointFeature?: IEndpointFeature;

	private currentIServiceProvidersFeature?: IServiceProvidersFeature;

	private fastReset(): void {
		this.currentIHttpRequestFeature = this;
		this.currentIEndpointFeature = this;

		this.currentIServiceProvidersFeature = undefined;
	}

	// Internal for testing
	/** @internal */ resetFeatureCollection(): void {
		this.fastReset();
		// TODO
		this.featureRevision++;
	}

	reset(): void {
		// TODO

		this.resetFeatureCollection();

		// TODO
	}

	initialize(): void {
		// TODO

		this.reset();
	}

	constructor(
		private readonly request: IncomingMessage,
		private readonly response: ServerResponse<IncomingMessage>,
	) {
		this.initialize();
	}

	protected beginRequestProcessing(): void {
		// Reset the features and timeout.
		this.reset();
		// TODO
	}

	private async processRequestsCore<TContext>(
		app: IHttpApp<TContext>,
	): Promise<void> {
		this.beginRequestProcessing();

		const context = app.createContext(this);

		// TODO: try
		await app.processRequest(context);
		// TODO: catch
	}

	async processRequests<TContext>(app: IHttpApp<TContext>): Promise<void> {
		// TODO: try
		this.processRequestsCore(app);
		// TODO: catch
	}

	get method(): string {
		return this.request.method ?? '';
	}

	get path(): string {
		return this.request.url ?? '';
	}

	private _endpoint?: Endpoint;
	get endpoint(): Endpoint | undefined {
		return this._endpoint;
	}

	private featureRevision = 0;
	get revision(): number {
		return this.featureRevision;
	}

	get<T>(key: Type): T | undefined {
		let feature: T | undefined;
		if (key.equals(Type.from('IHttpRequestFeature'))) {
			feature = this.currentIHttpRequestFeature as T;
		} else if (key.equals(Type.from('IEndpointFeature'))) {
			feature = this.currentIEndpointFeature as T;
		} else if (key.equals(Type.from('IServiceProvidersFeature'))) {
			feature = this.currentIServiceProvidersFeature as T;
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		// TODO

		return feature;
	}

	set<T>(key: Type, instance: T | undefined): void {
		this.featureRevision++;
		if (key.equals(Type.from('IHttpRequestFeature'))) {
			this.currentIHttpRequestFeature = instance as IHttpRequestFeature;
		} else if (key.equals(Type.from('IEndpointFeature'))) {
			this.currentIEndpointFeature = instance as IEndpointFeature;
		} else if (key.equals(Type.from('IServiceProvidersFeature'))) {
			this.currentIServiceProvidersFeature =
				instance as IServiceProvidersFeature;
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}
}
