import { IComparer } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/IEndpointComparerPolicy.cs,5539bf4bc2a3ea02,references
export interface IEndpointComparerPolicy {
	readonly comparer: IComparer<Endpoint>;
}
