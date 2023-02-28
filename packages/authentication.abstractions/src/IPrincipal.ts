import { IIdentity } from './IIdentity';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Security/Principal/IPrincipal.cs,40fe672fdd6dae6b,references
export interface IPrincipal {
	// Retrieve the identity object
	readonly identity: IIdentity | undefined;
	// Perform a check for a specific role
	isInRole(role: string): boolean;
}
