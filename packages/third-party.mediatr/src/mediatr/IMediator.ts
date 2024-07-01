import { IPublisher } from './IPublisher';
import { ISender } from './ISender';

export const IMediator = Symbol.for('IMediator');
// https://github.com/jbogard/MediatR/blob/c4f1a918b4cb90030f2df0878f5930b9ed7baf16/src/MediatR/IMediator.cs#L6
export interface IMediator extends ISender, IPublisher {}
