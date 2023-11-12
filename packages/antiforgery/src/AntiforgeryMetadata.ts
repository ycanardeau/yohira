import { IAntiforgeryMetadata } from './IAntiforgeryMetadata';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/src/Shared/AntiforgeryMetadata.cs,37fca56458a5a7a5,references
export class AntiforgeryMetadata implements IAntiforgeryMetadata {
	constructor(readonly requiresValidation: boolean) {}
}
