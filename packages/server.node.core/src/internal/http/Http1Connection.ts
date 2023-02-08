import { IFeatureCollection } from '@yohira/extensions.features';
import { IHttpApp } from '@yohira/hosting.server.abstractions';
import { Endpoint, IEndpointFeature } from '@yohira/http.abstractions';
import {
	IHttpRequestFeature,
	IHttpResponseBodyFeature,
	IServiceProvidersFeature,
} from '@yohira/http.features';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Http/Http1Connection.cs,9a7555a5b425c5dc,references
export class Http1Connection
	implements
		IFeatureCollection,
		IHttpRequestFeature,
		IHttpResponseBodyFeature,
		IEndpointFeature
{
	private currentIHttpRequestFeature?: IHttpRequestFeature;
	private currentIHttpResponseBodyFeature?: IHttpResponseBodyFeature;
	private currentIEndpointFeature?: IEndpointFeature;

	private currentIServiceProvidersFeature?: IServiceProvidersFeature;

	private fastReset(): void {
		this.currentIHttpRequestFeature = this;
		this.currentIHttpResponseBodyFeature = this;
		this.currentIEndpointFeature = this;

		this.currentIServiceProvidersFeature = undefined;
	}

	// Internal for testing
	/** @internal */ resetFeatureCollection(): void {
		this.fastReset();
		// TODO
		this.featureRevision++;
	}

	private _path?: string;
	private _queryString?: string;
	private _rawBody?: string;

	reset(): void {
		// TODO

		this.resetFeatureCollection();

		// TODO
		this._path = undefined;
		this._queryString = undefined;
		this._rawBody = undefined;
		// TODO

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

		const url = new URL(
			this.request.url ?? '',
			`http://${this.request.headers.host}`,
		);
		this._path = url.pathname;
		this._queryString = url.search;

		// REVIEW
		// https://nodejs.bootcss.com/node-request-data/
		const buffers = [];
		for await (const chunk of this.request) {
			buffers.push(chunk);
		}
		this._rawBody = Buffer.concat(buffers).toString();

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

	get rawBody(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._rawBody!;
	}

	get method(): string {
		return this.request.method ?? '';
	}

	get path(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._path!;
	}

	get queryString(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._queryString!;
	}

	private _endpoint?: Endpoint;
	get endpoint(): Endpoint | undefined {
		return this._endpoint;
	}
	set endpoint(value: Endpoint | undefined) {
		this._endpoint = value;
	}

	get stream(): Stream {
		return this.response;
	}

	sendFile(
		path: string,
		offset: number,
		count: number | undefined,
	): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}

	private featureRevision = 0;
	get revision(): number {
		return this.featureRevision;
	}

	get<T>(key: symbol): T | undefined {
		let feature: T | undefined;
		if (key === Symbol.for('IHttpRequestFeature')) {
			feature = this.currentIHttpRequestFeature as T;
		} else if (key === Symbol.for('IHttpResponseBodyFeature')) {
			feature = this.currentIHttpResponseBodyFeature as T;
		} else if (key === Symbol.for('IEndpointFeature')) {
			feature = this.currentIEndpointFeature as T;
		} else if (key === Symbol.for('IServiceProvidersFeature')) {
			feature = this.currentIServiceProvidersFeature as T;
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}

		// TODO

		return feature;
	}

	set<T>(key: symbol, instance: T | undefined): void {
		this.featureRevision++;
		if (key === Symbol.for('IHttpRequestFeature')) {
			this.currentIHttpRequestFeature = instance as IHttpRequestFeature;
		} else if (key === Symbol.for('IHttpResponseBodyFeature')) {
			this.currentIHttpResponseBodyFeature =
				instance as IHttpResponseBodyFeature;
		} else if (key === Symbol.for('IEndpointFeature')) {
			this.currentIEndpointFeature = instance as IEndpointFeature;
		} else if (key === Symbol.for('IServiceProvidersFeature')) {
			this.currentIServiceProvidersFeature =
				instance as IServiceProvidersFeature;
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}
}
