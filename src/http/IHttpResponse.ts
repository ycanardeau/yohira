import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IHttpContext } from '@/http/IHttpContext';
import { StatusCodes } from '@/http/StatusCodes';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResponse.cs,7642421540ea6ef2,references
export interface IHttpResponse {
	readonly httpContext: IHttpContext;
	statusCode: StatusCodes;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,46a23828b29f9242,references
const sendFileCore = async (
	response: IHttpResponse,
	fileName: string,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> => {
	// TODO
};

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/SendFileResponseExtensions.cs,7f1df561b7c6874a,references
export const sendFile = async (
	response: IHttpResponse,
	file: IFileInfo,
	offset: number,
	count: number | undefined,
	// TODO: cancellationToken
): Promise<void> => {
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
};
