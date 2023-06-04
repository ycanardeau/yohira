import { HMACSHA512 } from '@yohira/cryptography';
import { deriveKeysWithContextHeader } from '@yohira/data-protection';
import { expect, test } from 'vitest';

function testManagedKeyDerivation(
	kdk: Buffer,
	label: Buffer,
	contextHeader: Buffer,
	context: Buffer,
	numDerivedBytes: number,
	expectedDerivedSubkeyAsBase64: string,
): void {
	const labelSegment = Buffer.alloc(label.length);
	label.copy(labelSegment);
	const contextSegment = Buffer.alloc(context.length);
	context.copy(contextSegment);
	const derivedSubkeySegment = Buffer.alloc(numDerivedBytes);

	deriveKeysWithContextHeader(
		kdk,
		labelSegment,
		contextHeader,
		contextSegment,
		(bytes) => new HMACSHA512(bytes),
		derivedSubkeySegment,
	);
	expect(derivedSubkeySegment.toString('base64')).toBe(
		expectedDerivedSubkeyAsBase64,
	);
}

// https://github.com/dotnet/aspnetcore/blob/c2488eead6ead7208f543d0a57104b5d167b93f9/src/DataProtection/DataProtection/test/Microsoft.AspNetCore.DataProtection.Tests/SP800_108/SP800_108Tests.cs#L21
test('DeriveKeyWithContextHeader_Normal_Managed', () => {
	function DeriveKeyWithContextHeader_Normal_Managed(
		numDerivedBytes: number,
		expectedDerivedSubkeyAsBase64: string,
	): void {
		const kdk = Buffer.from('kdk', 'utf8');
		const label = Buffer.from('label', 'utf8');
		const contextHeader = Buffer.from('contextHeader', 'utf8');
		const context = Buffer.from('context', 'utf8');

		testManagedKeyDerivation(
			kdk,
			label,
			contextHeader,
			context,
			numDerivedBytes,
			expectedDerivedSubkeyAsBase64,
		);
	}

	DeriveKeyWithContextHeader_Normal_Managed(
		512 / 8 - 1,
		'V47WmHzPSkdC2vkLAomIjCzZlDOAetll3yJLcSvon7LJFjJpEN+KnSNp+gIpeydKMsENkflbrIZ/3s6GkEaH',
	);
	DeriveKeyWithContextHeader_Normal_Managed(
		512 / 8 + 0,
		'mVaFM4deXLl610CmnCteNzxgbM/VkmKznAlPauHcDBn0le06uOjAKLHx0LfoU2/Ttq9nd78Y6Nk6wArmdwJgJg==',
	);
	DeriveKeyWithContextHeader_Normal_Managed(
		512 / 8 + 1,
		'GaHPeqdUxriFpjRtkYQYWr5/iqneD/+hPhVJQt4rXblxSpB1UUqGqL00DMU/FJkX0iMCfqUjQXtXyfks+p++Ev4=',
	);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/c2488eead6ead7208f543d0a57104b5d167b93f9/src/DataProtection/DataProtection/test/Microsoft.AspNetCore.DataProtection.Tests/SP800_108/SP800_108Tests.cs#L77
test('DeriveKeyWithContextHeader_LongKey_Managed', () => {
	function DeriveKeyWithContextHeader_LongKey_Managed(
		numDerivedBytes: number,
		expectedDerivedSubkeyAsBase64: string,
	): void {
		const kdk = Buffer.alloc(50000); // CNG can't normally handle a 50,000 byte KDK, but we coerce it into working :)
		for (let i = 0; i < kdk.length; i++) {
			kdk[i] = i;
		}

		const label = Buffer.from('label', 'utf8');
		const contextHeader = Buffer.from('contextHeader', 'utf8');
		const context = Buffer.from('context', 'utf8');

		testManagedKeyDerivation(
			kdk,
			label,
			contextHeader,
			context,
			numDerivedBytes,
			expectedDerivedSubkeyAsBase64,
		);
	}

	DeriveKeyWithContextHeader_LongKey_Managed(
		512 / 8 - 1,
		'rt2hM6kkQ8hAXmkHx0TU4o3Q+S7fie6b3S1LAq107k++P9v8uSYA2G+WX3pJf9ZkpYrTKD7WUIoLkgA1R9lk',
	);
	DeriveKeyWithContextHeader_LongKey_Managed(
		512 / 8 + 0,
		'RKiXmHSrWq5gkiRSyNZWNJrMR0jDyYHJMt9odOayRAE5wLSX2caINpQmfzTH7voJQi3tbn5MmD//dcspghfBiw==',
	);
	DeriveKeyWithContextHeader_LongKey_Managed(
		512 / 8 + 1,
		'KedXO0zAIZ3AfnPqY1NnXxpC3HDHIxefG4bwD3g6nWYEc5+q7pjbam71Yqj0zgHMNC9Z7BX3wS1/tajFocRWZUk=',
	);
});

// TODO
