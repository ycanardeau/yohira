// https://source.dot.net/#Microsoft.AspNetCore.Authentication/ISecureDataFormat.cs,af577beeb5749d22,references
/**
 * A contract for securing data.
 */
export interface ISecureDataFormat<TData> {
	/**
	 * Protects the specified {@link data} for the specified {@link purpose}.
	 * @param data The value to protect
	 * @param purpose The purpose.
	 * @returns A data protected value.
	 */
	protect(data: TData, purpose?: string): string;

	/**
	 * Unprotects the specified {@link protectedText} using the specified {@link purpose}.
	 * @param protectedText The data protected value.
	 * @param purpose The purpose.
	 * @returns An instance of {@link TData}.
	 */
	unprotect(
		protectedText: string | undefined,
		purpose?: string,
	): TData | undefined;
}
