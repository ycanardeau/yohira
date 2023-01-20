import { Type } from '@yohira/base';
import { getRequiredFeature } from '@yohira/extensions.features';
import { IFileInfo } from '@yohira/extensions.file-providers';
import { IHttpResponse } from '@yohira/http.abstractions';
import { IHttpResponseBodyFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,46a23828b29f9242,references
async function sendFileCore(
	response: IHttpResponse,
	fileName: string,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> {
	// TODO
	const sendFile = getRequiredFeature<IHttpResponseBodyFeature>(
		response.httpContext.features,
		Type.from('IHttpResponseBodyFeature'),
	);

	// TODO: try
	await sendFile.sendFile(fileName, offset, count /* TODO: , localCancel */);
	// TODO: catch
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,7f1df561b7c6874a,references
export async function sendFile(
	response: IHttpResponse,
	file: IFileInfo,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> {
	if (!file.physicalPath?.trim()) {
		throw new Error('Method not implemented.');
	} else {
		await sendFileCore(
			response,
			file.physicalPath,
			offset,
			count,
			// TODO: cancellationToken
		);
	}
}
