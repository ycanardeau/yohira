import { RouteEndpoint } from '../RouteEndpoint';
import { Matcher } from './Matcher';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/MatcherBuilder.cs,d7e65e4dcc81e8aa,references
export abstract class MatcherBuilder {
	abstract addEndpoint(endpoint: RouteEndpoint): void;
	abstract build(): Matcher;
}
