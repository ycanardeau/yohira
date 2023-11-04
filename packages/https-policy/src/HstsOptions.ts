// https://source.dot.net/#Microsoft.AspNetCore.HttpsPolicy/HstsOptions.cs,39fe7c1be8a384b2,references
import { TimeSpan } from '@yohira/base';

/**
 * Options for the Hsts Middleware
 */
export class HstsOptions {
	maxAge = TimeSpan.fromDays(30);
	includeSubDomains = false;
	preload = false;
	excludedHosts = [
		'localhost',
		'127.0.0.1', // ipv4
		'[::1]', // ipv6
	];
}
