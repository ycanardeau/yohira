import { Result } from '@yohira/third-party.ts-results';

export interface IContentTypeProvider {
	tryGetContentType(subpath: string): Result<string, undefined>;
}
