import { PathSegment, tokenize } from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L11
test('Tokenize_EmptyString', () => {
	const segments: PathSegment[] = Array(1);

	const count = tokenize('', segments);

	expect(count).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L24
test('Tokenize_RootPath', () => {
	const segments: PathSegment[] = Array(1);

	const count = tokenize('/', segments);

	expect(count).toBe(0);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L37
test('Tokenize_SingleSegment', () => {
	const segments: PathSegment[] = Array(1);

	const count = tokenize('/abc', segments);

	expect(count).toBe(1);
	expect(segments[0].equals(new PathSegment(1, 3))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L51
test('Tokenize_WithSomeSegments', () => {
	const segments: PathSegment[] = Array(3);

	const count = tokenize('/a/b/c', segments);

	expect(count).toBe(3);
	expect(segments[0].equals(new PathSegment(1, 1))).toBe(true);
	expect(segments[1].equals(new PathSegment(3, 1))).toBe(true);
	expect(segments[2].equals(new PathSegment(5, 1))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L67
test('Tokenize_WithSomeSegments_TrailingSlash', () => {
	const segments: PathSegment[] = Array(3);

	const count = tokenize('/a/b/c/', segments);

	expect(count).toBe(3);
	expect(segments[0].equals(new PathSegment(1, 1))).toBe(true);
	expect(segments[1].equals(new PathSegment(3, 1))).toBe(true);
	expect(segments[2].equals(new PathSegment(5, 1))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L83
test('Tokenize_LongerSegments', () => {
	const segments: PathSegment[] = Array(3);

	const count = tokenize('/aaa/bb/ccccc', segments);

	expect(count).toBe(3);
	expect(segments[0].equals(new PathSegment(1, 3))).toBe(true);
	expect(segments[1].equals(new PathSegment(5, 2))).toBe(true);
	expect(segments[2].equals(new PathSegment(8, 5))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L99
test('Tokenize_EmptySegments', () => {
	const segments: PathSegment[] = Array(3);

	const count = tokenize('///c', segments);

	expect(count).toBe(3);
	expect(segments[0].equals(new PathSegment(1, 0))).toBe(true);
	expect(segments[1].equals(new PathSegment(2, 0))).toBe(true);
	expect(segments[2].equals(new PathSegment(3, 1))).toBe(true);
});

// https://github.com/dotnet/aspnetcore/blob/6f1752a798a9460b8a039750e30b827578528c90/src/Http/Routing/test/UnitTests/Matching/FastPathTokenizerTest.cs#L115
test('Tokenize_TooManySegments', () => {
	const segments: PathSegment[] = new Array(3);

	const count = tokenize('/a/b/c/d', segments);

	expect(count).toBe(3);
	expect(segments[0].equals(new PathSegment(1, 1))).toBe(true);
	expect(segments[1].equals(new PathSegment(3, 1))).toBe(true);
	expect(segments[2].equals(new PathSegment(5, 1))).toBe(true);
});
