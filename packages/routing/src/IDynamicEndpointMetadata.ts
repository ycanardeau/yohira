export const IDynamicEndpointMetadata = Symbol.for('IDynamicEndpointMetadata');
// https://source.dot.net/#Microsoft.AspNetCore.Routing/IDynamicEndpointMetadata.cs,af0d069e14439618,references
export interface IDynamicEndpointMetadata {
	readonly isDynamic: boolean;
}
