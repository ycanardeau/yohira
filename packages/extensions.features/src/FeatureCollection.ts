import { IFeatureCollection } from '@yohira/extensions.features/IFeatureCollection';
import { interfaces } from 'inversify';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureCollection.cs,6445f4078512cfd6,references
export class FeatureCollection
	extends Map<interfaces.ServiceIdentifier, any>
	implements IFeatureCollection {}
