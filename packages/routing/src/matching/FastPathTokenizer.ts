import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/FastPathTokenizer.cs,eccb63476cffadec,references
export function tokenize(
	path: string,
	segments: PathSegment[] /* TODO: Span<PathSegment> */,
): number {
	if (!path) {
		return 0;
	}

	let count = 0;
	let start = 1;
	let end: number;
	let span = path.substring(start); /* TODO: asSpan */
	while ((end = span.indexOf('/')) >= 0 && count < segments.length) {
		segments[count++] = new PathSegment(start, end);
		start += end + 1;
		span = path.substring(start) /* TODO: asSpan */;
	}

	const length = span.length;
	if (length > 0 && count < segments.length) {
		segments[count++] = new PathSegment(start, length);
	}

	return count;
}
