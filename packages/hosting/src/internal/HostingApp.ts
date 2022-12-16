import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingApplication.cs,91ffdac1d653a48b,references
export class HostingApp {
	constructor(private readonly app: RequestDelegate) {}
}
