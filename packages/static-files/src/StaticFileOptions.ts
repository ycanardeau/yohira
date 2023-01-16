import { IContentTypeProvider } from '@/IContentTypeProvider';
import { SharedOptionsBase } from '@/SharedOptionsBase';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileOptions.cs,fecf371ff955674d,references
export class StaticFileOptions extends SharedOptionsBase {
	/**
	 * Used to map files to content-types.
	 */
	contentTypeProvider!: IContentTypeProvider;
	/**
	 * The default content type for a request if the ContentTypeProvider cannot determine one.
	 * None is provided by default, so the client must determine the format themselves.
	 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7
	 */
	defaultContentType?: string;
	/**
	 * If the file is not a recognized content-type should it be served?
	 * Default: false.
	 */
	serveUnknownFileTypes = false;
}
