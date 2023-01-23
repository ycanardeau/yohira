import { Stream } from 'node:stream';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpResponseBodyFeature.cs,ecd3d1ed54caffee,references
/**
 * An aggregate of the different ways to interact with the response body.
 */
export interface IHttpResponseBodyFeature {
	/**
	 * The {@link Stream} for writing the response body.
	 */
	readonly stream: Stream;

	/**
	 * Sends the requested file in the response body. A response may include multiple writes.
	 * @param path The full disk path to the file.
	 * @param offset The offset in the file to start at.
	 * @param count The number of bytes to send, or null to send the remainder of the file.
	 */
	sendFile(
		path: string,
		offset: number,
		count: number | undefined,
		// TODO: cancellationToken,
	): Promise<void>;
}
