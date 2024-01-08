import { NodeTrace } from './infrastructure/NodeTrace';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel.Core/Internal/ServiceContext.cs,4ee6af25ffb3d8af,references
export class ServiceContext {
	log!: NodeTrace;
}
