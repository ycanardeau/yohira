import {
	HttpMethodMatcherPolicyIntegrationTestBase,
	testHttpMethodMatcherPolicy,
} from './HttpMethodMatcherPolicyIntegrationTestBase';

// https://github.com/dotnet/aspnetcore/blob/41751467fe5a4be092a3166b82abef9b606e91d3/src/Http/Routing/test/UnitTests/Matching/HttpMethodMatcherPolicyINodeBuilderPolicyIntegrationTest.cs#L7
class HttpMethodMatcherPolicyINodeBuilderPolicyIntegrationTestBase extends HttpMethodMatcherPolicyIntegrationTestBase {
	protected get hasDynamicMetadata(): boolean {
		return false;
	}
}

testHttpMethodMatcherPolicy(
	new HttpMethodMatcherPolicyINodeBuilderPolicyIntegrationTestBase(),
);
