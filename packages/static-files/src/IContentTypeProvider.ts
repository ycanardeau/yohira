import { Result } from 'ts-results';

export interface IContentTypeProvider {
	tryGetContentType(subpath: string): Result<string, undefined>;
}
