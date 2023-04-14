import { Ctor } from '@yohira/base';
import { Aes, HMACSHA256 } from '@yohira/cryptography';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/AuthenticatedEncryption/ConfigurationModel/ManagedAuthenticatedEncryptorConfiguration.cs,0edbe3db33251239,references
export class ManagedAuthenticatedEncryptorConfig {
	encryptionAlgorithmType = Aes;
	encryptionAlgorithmKeySize = 256;
	validationAlgorithmType: Ctor<unknown> = HMACSHA256;
}
