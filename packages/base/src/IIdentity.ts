// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Security/Principal/IIdentity.cs,76e73c1a6f198232,references
export interface IIdentity {
	// Access to the name string
	readonly name: string | undefined;
	// Access to Authentication 'type' info
	readonly authenticationType: string | undefined;
	// Determine if this represents the unauthenticated identity
	readonly isAuthenticated: boolean;
}
