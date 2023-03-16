import { IDataProtector } from '@yohira/data-protection.abstractions';
import { ILogger, LogLevel } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Session/LoggingExtensions.cs,3b65438417859c3c,references
function errorUnprotectingSessionCookie(logger: ILogger): void {
	logger.log(
		LogLevel.Warning,
		'Error unprotecting the session cookie.' /* LOC */,
	);
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/CookieProtection.cs,abe9e173c3604d5f,references
export function protectCookie(protector: IDataProtector, data: string): string {
	// TODO
	throw new Error('Method not implemented.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/CookieProtection.cs,dee77770acee2199,references
function pad(text: string): string {
	const padding = 3 - ((text.length + 3) % 4);
	if (padding === 0) {
		return text;
	}
	return text + '='.repeat(padding);
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/CookieProtection.cs,c8e8140902e61dc3,references
export function unprotectCookie(
	protector: IDataProtector,
	protectedText: string | undefined,
	logger: ILogger,
): string {
	try {
		if (!protectedText) {
			return '';
		}

		const protectedData = Buffer.from(pad(protectedText), 'base64');

		const userData = protector.unprotect(protectedData);
		if (userData === undefined) {
			return '';
		}

		return userData.toString();
	} catch (error) {
		// Log the exception, but do not leak other information
		errorUnprotectingSessionCookie(logger);
		return '';
	}
}
