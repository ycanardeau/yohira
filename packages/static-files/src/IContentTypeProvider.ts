import { Result } from '@yohira/third-party.ts-results/result';

export interface IContentTypeProvider {
	tryGetContentType(subpath: string): Result<string, undefined>;
}
