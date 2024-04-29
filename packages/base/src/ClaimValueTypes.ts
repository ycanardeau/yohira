const xmlSchemaNamespace = 'http://www.w3.org/2001/XMLSchema';

// https://source.dot.net/#System.Security.Claims/System/Security/Claims/ClaimValueTypes.cs,9f4523f9163bffd8,references
/**
 * Defines the claim value types of the framework.
 */
export const ClaimValueTypes = {
	xmlSchemaNamespace: xmlSchemaNamespace,
	string: `${xmlSchemaNamespace}#string`,
} as const;
