import { IAuthenticationHandler } from './IAuthenticationHandler';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationRequestHandler.cs,7cd632d339ca6f53,references
/**
 * Used to determine if a handler wants to participate in request processing.
 */
export interface IAuthenticationRequestHandler extends IAuthenticationHandler {
	handleRequest(): Promise<boolean>;
}
