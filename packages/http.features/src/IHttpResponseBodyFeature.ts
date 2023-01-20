// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpResponseBodyFeature.cs,ecd3d1ed54caffee,references
export interface IHttpResponseBodyFeature {
	sendFile(
		path: string,
		offset: number,
		count: number | undefined,
		// TODO: cancellationToken,
	): Promise<void>;
}
