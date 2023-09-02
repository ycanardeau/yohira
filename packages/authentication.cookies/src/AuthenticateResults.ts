import { AuthenticateResult } from '@yohira/authentication.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/AuthenticateResults.cs,c66ff14702a032ef,references
export const AuthenticateResults = {
	noPrincipal: AuthenticateResult.fail('No principal.'),
} as const;
