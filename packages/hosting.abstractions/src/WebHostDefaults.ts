// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/WebHostDefaults.cs,308cfa8cf929e677,references
/**
 * The configuration key associated with an application name.
 */
export enum WebHostDefaults {
	/**
	 * The configuration key associated with the application's environment setting.
	 */
	EnvKey = 'environment',
	/**
	 * The configuration key associated with the "webRoot" configuration.
	 */
	WebRootKey = 'webroot',
	/**
	 * The configuration key associated with the "urls" configuration.
	 */
	ServerUrlsKey = 'urls',
	/**
	 * The configuration key associated with the "http_ports" configuration.
	 */
	HttpPortsKey = 'http_ports',
	/**
	 * The configuration key associated with the "https_ports" configuration.
	 */
	HttpsPortsKey = 'https_ports',
	/**
	 * The configuration key associated with the "PreferHostingUrls" configuration.
	 */
	PreferHostingUrlsKey = 'preferHostingUrls',
}
