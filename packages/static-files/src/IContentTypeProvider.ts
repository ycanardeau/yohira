import { Result } from 'ts-results-es';

export interface IContentTypeProvider {
	tryGetContentType(subpath: string): Result<string, undefined>;
}
