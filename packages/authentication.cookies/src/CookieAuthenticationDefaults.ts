// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Cookies/CookieAuthenticationDefaults.cs,c235d2f7a05ff634,references
/**
 * Default values related to cookie-based authentication handler
 */
export const CookieAuthenticationDefaults = {
	/**
	 * The default value used for CookieAuthenticationOptions.authenticationScheme
	 */
	authenticationScheme: 'Cookies',
	/**
	 * The prefix used to provide a default CookieAuthenticationOptions.cookieName
	 */
	cookiePrefix: '.yohira.',
	// TODO
	/**
	 * The default value of the CookieAuthenticationOptions.returnUrlParameter
	 */
	returnUrlParameter: 'ReturnUrl',
} as const;
