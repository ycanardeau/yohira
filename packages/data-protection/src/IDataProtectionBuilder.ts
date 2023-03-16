import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/IDataProtectionBuilder.cs,0d28d3f2f6e1654b,references
export interface IDataProtectionBuilder {
	readonly services: IServiceCollection;
}
