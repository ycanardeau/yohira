import { HttpRequestIdentifierFeature } from '@yohira/http';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http/test/Features/HttpRequestIdentifierFeatureTests.cs#L9C17-L9C42
test('TraceIdentifier_ReturnsId', () => {
	const feature = new HttpRequestIdentifierFeature();

	const id = feature.traceIdentifier;

	expect(id).not.toBeUndefined();
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http/test/Features/HttpRequestIdentifierFeatureTests.cs#L19C17-L19C48
test('TraceIdentifier_ReturnsStableId', () => {
	const feature = new HttpRequestIdentifierFeature();

	const id1 = feature.traceIdentifier;
	const id2 = feature.traceIdentifier;

	expect(id1 === id2).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http/test/Features/HttpRequestIdentifierFeatureTests.cs#L30
test('TraceIdentifier_ReturnsUniqueIdForDifferentInstances', () => {
	const feature1 = new HttpRequestIdentifierFeature();
	const feature2 = new HttpRequestIdentifierFeature();

	const id1 = feature1.traceIdentifier;
	const id2 = feature2.traceIdentifier;

	expect(id1 === id2).toBe(false);
});
