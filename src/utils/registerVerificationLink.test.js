import { describe, expect, it } from 'vitest';
import { parseRegisterVerificationParams } from './registerVerificationLink';

describe('parseRegisterVerificationParams', () => {
  it('parses email request id and code aliases', () => {
    expect(
      parseRegisterVerificationParams('?email=ada%40example.org&request_id=register_123&code=654321')
    ).toEqual({
      email: 'ada@example.org',
      username: '',
      requestId: 'register_123',
      verificationCode: '654321',
    });
  });

  it('parses username and verificationCode', () => {
    expect(
      parseRegisterVerificationParams('?username=ada&requestId=register_abc&verificationCode=123456')
    ).toEqual({
      email: '',
      username: 'ada',
      requestId: 'register_abc',
      verificationCode: '123456',
    });
  });
});
