import { EntityTagHeaderValue } from '@yohira/http.headers';

// https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/src/Shared/ResultsHelpers/FileResultInfo.cs,ad7f905b7f51b2c4,references
export class FileResultInfo {
	contentType!: string;
	fileDownloadName!: string;
	lastModified: Date /* TODO: DateTimeOffset */ | undefined;
	entityTag: EntityTagHeaderValue | undefined;
	enableRangeProcessing = false;
}
