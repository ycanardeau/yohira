import { IReadonlyList } from '@yohira/base';

import { PathSegment } from '../matching/PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Patterns/RoutePattern.cs,5f437021e7826e12,references
export class RoutePattern {
	constructor(readonly pathSegments: IReadonlyList<PathSegment>) {}
}
