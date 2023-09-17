import { IFeatureCollection } from '@yohira/extensions.features';
import { IHttpApp } from '@yohira/hosting.server.abstractions';
import { Endpoint, IEndpointFeature } from '@yohira/http.abstractions';
import {
	IHttpRequestFeature,
	IHttpResponseBodyFeature,
	IHttpResponseFeature,
	IServiceProvidersFeature,
} from '@yohira/http.features';
import {
	IncomingHttpHeaders,
	IncomingMessage,
	ServerResponse,
} from 'node:http';
import { Stream } from 'node:stream';

import { RequestProcessingStatus } from './RequestProcessingStatus';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Http/Http1Connection.cs,9a7555a5b425c5dc,references
export class Http1Connection
	implements
		IFeatureCollection,
		IHttpRequestFeature,
		IHttpResponseFeature,
		IHttpResponseBodyFeature,
		IEndpointFeature
{
	private currentIHttpRequestFeature: IHttpRequestFeature | undefined;
	private currentIHttpResponseFeature: IHttpResponseFeature | undefined;
	private currentIHttpResponseBodyFeature:
		| IHttpResponseBodyFeature
		| undefined;
	private currentIEndpointFeature: IEndpointFeature | undefined;

	private currentIServiceProvidersFeature:
		| IServiceProvidersFeature
		| undefined;

	private fastReset(): void {
		this.currentIHttpRequestFeature = this;
		this.currentIHttpResponseFeature = this;
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

	private _onStarting:
		| [(state: object) => Promise<void>, object][]
		| undefined;

	protected requestProcessingStatus = RequestProcessingStatus.RequestPending;

	private _scheme: string | undefined;
	private _pathBase: string | undefined;
	private _path: string | undefined;
	private _queryString: string | undefined;
	private _rawBody: string | undefined;

	reset(): void {
		this._onStarting?.splice(0, this._onStarting.length) /* TODO: clear */;
		// TODO

		this.requestProcessingStatus = RequestProcessingStatus.RequestPending;

		// TODO

		this.resetFeatureCollection();

		// TODO
		this._pathBase = undefined;
		this._path = undefined;
		this._queryString = undefined;
		this._rawBody = undefined;
		// TODO

		// TODO

		if (this._scheme === undefined) {
			this._scheme =
				this.response.socket !== null &&
				'encrypted' in this.response.socket /* REVIEW */
					? 'https'
					: 'http';
		}

		this.scheme = this._scheme;

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

	get hasResponseStarted(): boolean {
		return (
			this.requestProcessingStatus >=
			RequestProcessingStatus.HeadersCommitted
		);
	}

	protected beginRequestProcessing(): void {
		// Reset the features and timeout.
		this.reset();
		// TODO
	}

	protected fireOnStarting(): Promise<void> {
		async function processEvents(
			protocol: Http1Connection,
			events: [(state: object) => Promise<void>, object][],
		): Promise<void> {
			// Try/Catch is outside the loop as any error that occurs is before the request starts.
			// So we want to report it as an ApplicationError to fail the request and not process more events.
			try {
				let entry:
					| [(state: object) => Promise<void>, object]
					| undefined;
				while ((entry = events.pop())) {
					await entry[0](entry[1]);
				}
			} catch (error) {
				// TODO
				throw new Error('Method not implemented.');
			}
		}

		const onStarting = this._onStarting;
		if (onStarting !== undefined && onStarting.length > 0) {
			return processEvents(this, onStarting);
		}

		return Promise.resolve();
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
		// TODO: log

		// Run the application code for this request
		await app.processRequest(context);

		// Trigger OnStarting if it hasn't been called yet and the app hasn't
		// already failed. If an OnStarting callback throws we can go through
		// our normal error handling in ProduceEnd.
		// https://github.com/aspnet/KestrelHttpServer/issues/43
		if (
			!this.hasResponseStarted &&
			// TODO: this.applicationError === undefined &&
			this._onStarting !== undefined &&
			this._onStarting.length > 0
		) {
			await this.fireOnStarting();
		}

		// TODO
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

	get scheme(): string {
		return this._scheme ?? 'http';
	}
	set scheme(value: string) {
		this._scheme = value;
	}

	get pathBase(): string {
		return this._pathBase ?? '';
	}

	get path(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._path!;
	}

	get queryString(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._queryString!;
	}

	get headers(): IncomingHttpHeaders {
		return this.request.headers;
	}

	private _endpoint: Endpoint | undefined;
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
		if (key === IHttpRequestFeature) {
			feature = this.currentIHttpRequestFeature as T;
		} else if (key === IHttpResponseFeature) {
			feature = this.currentIHttpResponseFeature as T;
		} else if (key === IHttpResponseBodyFeature) {
			feature = this.currentIHttpResponseBodyFeature as T;
		} else if (key === IEndpointFeature) {
			feature = this.currentIEndpointFeature as T;
		} else if (key === IServiceProvidersFeature) {
			feature = this.currentIServiceProvidersFeature as T;
		}

		// TODO

		return feature;
	}

	set<T>(key: symbol, instance: T | undefined): void {
		this.featureRevision++;
		if (key === IHttpRequestFeature) {
			this.currentIHttpRequestFeature = instance as IHttpRequestFeature;
		} else if (key === IHttpResponseFeature) {
			this.currentIHttpResponseFeature = instance as IHttpResponseFeature;
		} else if (key === IHttpResponseBodyFeature) {
			this.currentIHttpResponseBodyFeature =
				instance as IHttpResponseBodyFeature;
		} else if (key === IEndpointFeature) {
			this.currentIEndpointFeature = instance as IEndpointFeature;
		} else if (key === IServiceProvidersFeature) {
			this.currentIServiceProvidersFeature =
				instance as IServiceProvidersFeature;
		}

		// TODO
	}

	onStarting(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {
		if (this.hasResponseStarted) {
			throw new Error(
				'onStarting cannot be set because the response has already started.' /* LOC */,
			);
		}

		if (this._onStarting === undefined) {
			this._onStarting = [];
		}
		this._onStarting.push([callback, state]);
	}
}
