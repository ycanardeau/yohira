const claimTypeNamespace =
	'http://schemas.microsoft.com/ws/2008/06/identity/claims';

const claimType2005Namespace =
	'http://schemas.xmlsoap.org/ws/2005/05/identity/claims';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimTypes.cs,1f8b9c14a9b34152,references
/**
 * Defines the claim types that are supported by the framework.
 */
export const ClaimTypes = {
	claimTypeNamespace: claimTypeNamespace,

	role: `${claimTypeNamespace}/role`,

	claimType2005Namespace: claimType2005Namespace,

	name: `${claimType2005Namespace}/name`,
} as const;
