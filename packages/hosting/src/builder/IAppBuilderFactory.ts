import { IAppBuilder } from '@yohira/http.abstractions';

export const IAppBuilderFactory = Symbol.for('IAppBuilderFactory');
// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Builder/IApplicationBuilderFactory.cs,07f2f2ef7e279e84,references
export interface IAppBuilderFactory {
	createBuilder(/* TODO: serverFeatures */): IAppBuilder;
}
