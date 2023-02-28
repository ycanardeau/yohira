import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/AuthenticationBuilder.cs,ae8b6602eaed3fe4,references
export class AuthenticationBuilder {
	constructor(readonly services: IServiceCollection) {}
}
