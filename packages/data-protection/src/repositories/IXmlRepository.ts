import { XElement } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Repositories/IXmlRepository.cs,57162e3387ca00b0,references
export interface IXmlRepository {
	getAllElements(): readonly XElement[];
}
