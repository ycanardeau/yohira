import { IPAddress, IPEndPoint, List } from '@yohira/base';
import { IFeatureCollection } from '@yohira/extensions.features';
import { IHttpApp } from '@yohira/hosting.server.abstractions';
import { Endpoint, IEndpointFeature } from '@yohira/http.abstractions';
import {
	IHttpAuthenticationFeature,
	IHttpConnectionFeature,
	IHttpRequestFeature,
	IHttpResponseBodyFeature,
	IHttpResponseFeature,
	IResponseHeaderDictionary,
	IServiceProvidersFeature,
	ITlsConnectionFeature,
} from '@yohira/http.features';
import { createReadStream } from 'node:fs';
import {
	IncomingHttpHeaders,
	IncomingMessage,
	ServerResponse,
} from 'node:http';
import { Readable, Stream, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { HttpConnectionContext } from '../HttpConnectionContext';
import { ServiceContext } from '../ServiceContext';
import { NodeTrace } from '../infrastructure/NodeTrace';
import { RequestProcessingStatus } from './RequestProcessingStatus';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/Http/Http1Connection.cs,9a7555a5b425c5dc,references
export class Http1Connection
	implements
		IFeatureCollection,
		IHttpRequestFeature,
		IHttpResponseFeature,
		IHttpResponseBodyFeature,
		IEndpointFeature,
		IHttpConnectionFeature
{
	private static readonly schemeHttp = 'http';
	private static readonly schemeHttps = 'https';

	private currentIHttpRequestFeature: IHttpRequestFeature | undefined;
	private currentIHttpResponseFeature: IHttpResponseFeature | undefined;
	private currentIHttpResponseBodyFeature:
		| IHttpResponseBodyFeature
		| undefined;
	private currentIEndpointFeature: IEndpointFeature | undefined;
	private currentIHttpConnectionFeature: IHttpConnectionFeature | undefined;

	private currentIServiceProvidersFeature:
		| IServiceProvidersFeature
		| undefined;
	private currentIHttpAuthenticationFeature:
		| IHttpAuthenticationFeature
		| undefined;

	private fastReset(): void {
		this.currentIHttpRequestFeature = this;
		this.currentIHttpResponseFeature = this;
		this.currentIHttpResponseBodyFeature = this;
		this.currentIEndpointFeature = this;
		this.currentIHttpConnectionFeature = this;

		this.currentIServiceProvidersFeature = undefined;
	}

	// Internal for testing
	/** @internal */ resetFeatureCollection(): void {
		this.fastReset();
		this.maybeExtra?.clear();
		this.featureRevision++;
	}

	private _onStarting:
		| [(state: object) => Promise<void>, object][]
		| undefined;
	private _onCompleted:
		| [(state: object) => Promise<void>, object][]
		| undefined;

	protected requestProcessingStatus = RequestProcessingStatus.RequestPending;

	protected applicationError: Error | undefined;

	private context!: HttpConnectionContext;

	remoteIpAddress: IPAddress | undefined;
	remotePort = 0;
	localIpAddress: IPAddress | undefined;
	localPort = 0;
	private _scheme: string | undefined;
	private _pathBase: string | undefined;
	private _path: string | undefined;
	private _queryString: string | undefined;
	private _rawBody: string | undefined;

	reset(): void {
		this._onStarting?.splice(0, this._onStarting.length) /* TODO: clear */;
		this._onCompleted?.splice(
			0,
			this._onCompleted.length,
		) /* TODO: clear */;
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

		const remoteEndPoint = this.remoteEndPoint;
		this.remoteIpAddress = remoteEndPoint?.address;
		this.remotePort = remoteEndPoint?.port ?? 0;
		const localEndPoint = this.localEndPoint;
		this.localIpAddress = localEndPoint?.address;
		this.localPort = localEndPoint?.port ?? 0;

		// TODO

		if (this._scheme === undefined) {
			const tlsFeature =
				this.connectionFeatures?.get<ITlsConnectionFeature>(
					ITlsConnectionFeature,
				);
			this._scheme =
				tlsFeature !== undefined
					? Http1Connection.schemeHttps
					: Http1Connection.schemeHttp;
		}

		this.scheme = this._scheme;

		// TODO
	}

	initialize(context: HttpConnectionContext): void {
		this.context = context;

		// TODO

		this.reset();
	}

	readonly input: Readable;
	readonly output: Writable; /* TODO */

	constructor(context: HttpConnectionContext) {
		this.initialize(context);

		this.input = context.transport.input;
		this.output = context.transport.output;
	}

	get serviceContext(): ServiceContext {
		return this.context.serviceContext;
	}

	get connectionId(): string {
		return '' /* TODO */;
	}

	get localEndPoint(): IPEndPoint | undefined {
		return this.context.localEndPoint;
	}

	get remoteEndPoint(): IPEndPoint | undefined {
		return this.context.remoteEndPoint;
	}

	get connectionFeatures(): IFeatureCollection {
		return this.context.connectionFeatures;
	}

	get log(): NodeTrace {
		return this.serviceContext.log;
	}

	get hasResponseStarted(): boolean {
		return (
			this.requestProcessingStatus >=
			RequestProcessingStatus.HeadersCommitted
		);
	}

	protected onRequestProcessingEnded(): void {
		// TODO

		this.reset();
	}

	protected beginRequestProcessing(): void {
		// Reset the features and timeout.
		this.reset();
		// TODO
	}

	reportApplicationError(error: Error | undefined): void {
		if (!error) {
			return;
		}

		if (this.applicationError === undefined) {
			this.applicationError = error;
		} else if (this.applicationError instanceof AggregateError) {
			this.applicationError = new AggregateError([
				...this.applicationError.errors,
				error,
			]);
		} else {
			this.applicationError = new AggregateError([
				this.applicationError,
				error,
			]);
		}

		this.log.applicationError(
			this.connectionId,
			'' /* TODO: this.traceIdentifier */,
			error,
		);
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
				if (error instanceof Error) {
					protocol.reportApplicationError(error);
				} else {
					throw error;
				}
			}
		}

		const onStarting = this._onStarting;
		if (onStarting !== undefined && onStarting.length > 0) {
			return processEvents(this, onStarting);
		}

		return Promise.resolve();
	}

	protected fireOnCompleted(): Promise<void> {
		async function processEvents(
			protocol: Http1Connection,
			events: [(state: object) => Promise<void>, object][],
		): Promise<void> {
			// Try/Catch is inside the loop as any error that occurs is after the request has finished.
			// So we will just log it and keep processing the events, as the completion has already happened.
			try {
				let entry:
					| [(state: object) => Promise<void>, object]
					| undefined;
				while ((entry = events.pop())) {
					await entry[0](entry[1]);
				}
			} catch (error) {
				if (error instanceof Error) {
					protocol.log.applicationError(
						protocol.connectionId,
						'' /* TODO: protocol.traceIdentifier */,
						error,
					);
				} else {
					throw error;
				}
			}
		}

		const onCompleted = this._onCompleted;
		if (onCompleted !== undefined && onCompleted.length > 0) {
			return processEvents(this, onCompleted);
		}

		return Promise.resolve();
	}

	private async processRequestsCore<TContext>(
		app: IHttpApp<TContext>,
	): Promise<void> {
		this.beginRequestProcessing();

		const url = new URL(
			(this.input as IncomingMessage).url ?? '',
			`http://${(this.input as IncomingMessage).headers.host}`,
		);
		this._path = url.pathname;
		this._queryString = url.search;

		// REVIEW
		// https://nodejs.bootcss.com/node-request-data/
		const buffers = [];
		for await (const chunk of this.input as IncomingMessage) {
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

		// TODO

		if (this._onCompleted !== undefined && this._onCompleted.length > 0) {
			await this.fireOnCompleted();
		}

		// TODO
	}

	async processRequests<TContext>(app: IHttpApp<TContext>): Promise<void> {
		try {
			await this.processRequestsCore(app);
		} /* TODO */ finally {
			try {
				// TODO
			} /* TODO */ finally {
				this.onRequestProcessingEnded();
			}
		}
	}

	get rawBody(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._rawBody!;
	}

	get method(): string {
		return (this.input as IncomingMessage).method ?? '';
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

	get requestHeaders(): IncomingHttpHeaders {
		return (this.input as IncomingMessage).headers;
	}

	get responseHeaders(): IResponseHeaderDictionary {
		return this.output as ServerResponse;
	}

	get hasStarted(): boolean {
		return this.hasResponseStarted;
	}

	private _endpoint: Endpoint | undefined;
	get endpoint(): Endpoint | undefined {
		return this._endpoint;
	}
	set endpoint(value: Endpoint | undefined) {
		this._endpoint = value;
	}

	get stream(): Stream {
		return this.output as ServerResponse;
	}

	sendFile(
		path: string,
		offset: number,
		count: number | undefined,
	): Promise<void> {
		return pipeline(
			createReadStream(path, {
				start: offset,
				end: count !== undefined ? offset + count : undefined,
			}),
			this.output as ServerResponse,
		);
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

	onCompleted(
		callback: (state: object) => Promise<void>,
		state: object,
	): void {
		if (this._onCompleted === undefined) {
			this._onCompleted = [];
		}
		this._onCompleted.push([callback, state]);
	}

	private featureRevision = 0;
	get revision(): number {
		return this.featureRevision;
	}

	private maybeExtra: List<[symbol, any]> | undefined;

	private extraFeatureGet(key: symbol): any /* TODO */ {
		if (this.maybeExtra === undefined) {
			return undefined;
		}
		for (let i = 0; i < this.maybeExtra.count; i++) {
			const kv = this.maybeExtra.get(i);
			if (kv[0] === key) {
				return kv[1];
			}
		}
		return undefined;
	}

	private extraFeatureSet(key: symbol, value: any /* TODO */): void {
		if (value === undefined) {
			if (this.maybeExtra === undefined) {
				return;
			}
			for (let i = 0; i < this.maybeExtra.count; i++) {
				if (this.maybeExtra.get(i)[0] === key) {
					this.maybeExtra.removeAt(i);
					return;
				}
			}
		} else {
			if (this.maybeExtra === undefined) {
				this.maybeExtra = new List();
			}
			for (let i = 0; i < this.maybeExtra.count; i++) {
				if (this.maybeExtra.get(i)[0] === key) {
					this.maybeExtra.set(i, [key, value]);
					return;
				}
			}
			this.maybeExtra.add([key, value]);
		}
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
		} else if (key === IHttpAuthenticationFeature) {
			feature = this.currentIHttpAuthenticationFeature as T;
		} else if (key === IHttpConnectionFeature) {
			feature = this.currentIHttpConnectionFeature as T;
		} else if (this.maybeExtra !== undefined) {
			feature = this.extraFeatureGet(key);
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
		} else if (key === IHttpAuthenticationFeature) {
			this.currentIHttpAuthenticationFeature =
				instance as IHttpAuthenticationFeature;
		} else if (key === IHttpConnectionFeature) {
			this.currentIHttpConnectionFeature =
				instance as IHttpConnectionFeature;
		} else {
			this.extraFeatureSet(key, instance);
		}

		// TODO
	}

	*[Symbol.iterator](): Iterator<[symbol, any]> {
		if (this.currentIHttpRequestFeature !== undefined) {
			yield [IHttpRequestFeature, this.currentIHttpRequestFeature];
		} else if (this.currentIHttpResponseFeature !== undefined) {
			yield [IHttpResponseFeature, this.currentIHttpResponseFeature];
		} else if (this.currentIHttpResponseBodyFeature !== undefined) {
			yield [
				IHttpResponseBodyFeature,
				this.currentIHttpResponseBodyFeature,
			];
		} else if (this.currentIEndpointFeature !== undefined) {
			yield [IEndpointFeature, this.currentIEndpointFeature];
		} else if (this.currentIServiceProvidersFeature !== undefined) {
			yield [
				IServiceProvidersFeature,
				this.currentIServiceProvidersFeature,
			];
		} else if (this.currentIHttpAuthenticationFeature !== undefined) {
			yield [
				IHttpAuthenticationFeature,
				this.currentIHttpAuthenticationFeature,
			];
		}

		if (this.maybeExtra !== undefined) {
			for (const item of this.maybeExtra) {
				yield item;
			}
		}
	}
}
