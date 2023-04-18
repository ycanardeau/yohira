// https://source.dot.net/#System.Security.Cryptography/System/Security/Cryptography/PaddingMode.cs,78e6983a4b4595dc,references
// This enum represents the padding method to use for filling out short blocks.
// "None" means no padding (whole blocks required).
// "PKCS7" is the padding mode defined in RFC 2898, Section 6.1.1, Step 4, generalized
// to whatever block size is required.
// "Zeros" means pad with zero bytes to fill out the last block.
// "ISO 10126" is the same as PKCS5 except that it fills the bytes before the last one with
// random bytes.
// "ANSI X.923" fills the bytes with zeros and puts the number of padding  bytes in the last byte.
export enum PaddingMode {
	None = 1,
	PKCS7 = 2,
	Zeros = 3,
	ANSIX923 = 4,
	ISO10126 = 5,
}
