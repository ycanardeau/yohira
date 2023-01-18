import { EndpointDataSource } from '../EndpointDataSource';
import { Matcher } from '../matching/Matcher';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/MatcherFactory.cs,5e2c037d4ded4e46,references
export abstract class MatcherFactory {
	abstract createMatcher(dataSource: EndpointDataSource): Matcher;
}
