import { StringValues } from '@yohira/extensions.primitives';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHeaderDictionary.cs,0b9d30cbbb1c8cbf,references
export interface IHeaderDictionary extends Record<string, StringValues> {}
