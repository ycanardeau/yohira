import { IDataProtector } from '@yohira/data-protection.abstractions';
import { ILogger } from '@yohira/extensions.logging.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Session/CookieProtection.cs,abe9e173c3604d5f,references
export function protectCookie(protector: IDataProtector, data: string): string {
	// TODO
	throw new Error('Method not implemented.');
}

// https://source.dot.net/#Microsoft.AspNetCore.Session/CookieProtection.cs,c8e8140902e61dc3,references
export function unprotectCookie(
	protector: IDataProtector,
	protectedText: string | undefined,
	logger: ILogger,
): string {
	// TODO
	throw new Error('Method not implemented.');
}
