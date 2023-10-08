import { IFeatureCollection } from '@yohira/extensions.features';
import {
	IHttpRequestFeature,
	IHttpResponseBodyFeature,
	IHttpResponseFeature,
} from '@yohira/http.features';
import { Http1Connection } from '@yohira/server.node.core';
import { IncomingMessage, ServerResponse } from 'node:http';
import { beforeEach, expect, test } from 'vitest';

import { TestHttp1Connection } from './TestHttp1Connection';

let http1Connection: TestHttp1Connection;
// TODO: let httpConnectionContext: HttpConnectionContext;
let collection: IFeatureCollection;

beforeEach(() => {
	/* TODO: const context = createHttpConnectionContext(
		{},
		new TestServiceContext(),
		{},
		new FeatureCollection(),
		{},
	); */

	// TODO: httpConnectionContext = context;
	http1Connection = new TestHttp1Connection(
		{} as IncomingMessage,
		{
			socket: {},
		} as ServerResponse<IncomingMessage>,
	);
	http1Connection.reset();
	collection = http1Connection;
});

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L43C16-L43C35
test('FeaturesStartAsSelf', () => {
	let featureCount = 0;
	for (const featureIter of collection) {
		const type = featureIter[0];
		if (true /* TODO */) {
			const featureLookup = collection.get(type);
			expect(featureIter[1] === featureLookup).toBe(true);
			expect(collection === featureLookup).toBe(true);
			featureCount++;
		}
	}

	expect(featureCount).not.toBe(0);
});

function createHttp1Connection(): Http1Connection {
	return new TestHttp1Connection(
		{} as IncomingMessage,
		{
			socket: {},
		} as ServerResponse<IncomingMessage>,
	);
}

function eachHttpProtocolFeatureSetAndUnique(): number {
	let featureCount = 0;
	for (const item of collection) {
		// TODO: const type = item[0];
		if (true /* TODO */) {
			const matches = Array.from(collection).filter(
				(kv) => kv[1] === item[1],
			);
			expect(matches.length).toBe(1);

			featureCount++;
		}
	}

	expect(featureCount).not.toBe(0);

	return featureCount;
}

function setFeaturesToNonDefault(): number {
	let featureCount = 0;
	for (const feature of collection) {
		const type = feature[0];
		if (true /* TODO */) {
			collection.set(type, createHttp1Connection());
			featureCount++;
		}
	}

	const protocolFeaturesCount = eachHttpProtocolFeatureSetAndUnique();

	expect(featureCount).toBe(protocolFeaturesCount);

	return featureCount;
}

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L64C16-L64C39
test('FeaturesCanBeAssignedTo', () => {
	let featureCount = setFeaturesToNonDefault();
	expect(featureCount).not.toBe(0);

	featureCount = 0;
	for (const feature of collection) {
		const type = feature[0];
		if (true /* TODO */) {
			expect(feature[1] === collection.get(type)).toBe(true);
			expect(collection === collection.get(type)).toBe(false);
			featureCount++;
		}
	}

	expect(featureCount).not.toBe(0);
});

function featuresStartAsSelf(): number {
	let featureCount = 0;
	for (const featureIter of collection) {
		const type = featureIter[0];
		if (true /* TODO */) {
			const featureLookup = collection.get(type);
			expect(featureIter[1] === featureLookup).toBe(true);
			expect(collection === featureLookup).toBe(true);
			featureCount++;
		}
	}

	expect(featureCount).not.toBe(0);

	return featureCount;
}

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L87C17-L87C36
test('FeaturesResetToSelf', () => {
	const featuresAssigned = setFeaturesToNonDefault();
	http1Connection.resetFeatureCollection();
	const featuresReset = featuresStartAsSelf();

	expect(featuresReset === featuresAssigned).toBe(true);
});

function compareGenericGetterToIndexer(): void {
	expect(
		collection.get(IHttpRequestFeature) ===
			collection.get(IHttpRequestFeature),
	).toBe(true);
	// TODO
	expect(
		collection.get(IHttpResponseFeature) ===
			collection.get(IHttpResponseFeature),
	).toBe(true);
	expect(
		collection.get(IHttpResponseBodyFeature) ===
			collection.get(IHttpResponseBodyFeature),
	).toBe(true);
	// TODO
}

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L97C17-L97C46
test('FeaturesByGenericSameAsByType', () => {
	const featuresAssigned = setFeaturesToNonDefault();

	compareGenericGetterToIndexer();

	http1Connection.resetFeatureCollection();
	const featuresReset = featuresStartAsSelf();

	expect(featuresReset === featuresAssigned).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L110C17-L110C47
test('FeaturesSetByTypeSameAsGeneric', () => {
	collection.set(IHttpRequestFeature, createHttp1Connection());
	// TODO
	collection.set(IHttpResponseFeature, createHttp1Connection());
	collection.set(IHttpResponseBodyFeature, createHttp1Connection());
	// TODO

	compareGenericGetterToIndexer();

	eachHttpProtocolFeatureSetAndUnique();
});

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L140C17-L140C49
test('FeaturesSetByGenericSameAsByType', () => {
	collection.set(IHttpRequestFeature, createHttp1Connection());
	// TODO
	collection.set(IHttpResponseFeature, createHttp1Connection());
	collection.set(IHttpResponseBodyFeature, createHttp1Connection());
	// TODO

	compareGenericGetterToIndexer();

	eachHttpProtocolFeatureSetAndUnique();
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/923c83a76bb542629c323c0f380f5cd08afb3259/src/Servers/Kestrel/Core/test/Http1/Http1HttpProtocolFeatureCollectionTests.cs#L176C17-L176C38
test('SetExtraFeatureAsNull', () => {
	collection.set(Symbol.for('string'), undefined);
	expect(
		Array.from(collection).filter((kv) => kv[0] === Symbol.for('string'))
			.length,
	).toBe(0);

	collection.set(Symbol.for('string'), 'A string');
	expect(
		Array.from(collection).filter((kv) => kv[0] === Symbol.for('string'))
			.length,
	).toBe(1);

	collection.set(Symbol.for('string'), undefined);
	expect(
		Array.from(collection).filter((kv) => kv[0] === Symbol.for('string'))
			.length,
	).toBe(0);
});

// TODO
