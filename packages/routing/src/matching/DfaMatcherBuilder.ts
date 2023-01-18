import { DfaMatcher } from './DfaMatcher';
import { Matcher } from './Matcher';
import { MatcherBuilder } from './MatcherBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcherBuilder.cs,df60c73e02845001,references
export class DfaMatcherBuilder extends MatcherBuilder {
	build(): Matcher {
		// TODO

		return new DfaMatcher(/* TODO */);
	}
}
