// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/WebHostUtilities.cs,0b59454af1f4ac85,references
export function parseBoolean(value: string | undefined): boolean {
	return value?.toLowerCase() === 'true' || value?.toLowerCase() === '1';
}
