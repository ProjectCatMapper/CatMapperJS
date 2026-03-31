import { describe, expect, it } from 'vitest';
import { parseResetLinkParams } from './forgotPasswordLink';

describe('parseResetLinkParams', () => {
  it('parses modern forgot-password query parameters', () => {
    expect(
      parseResetLinkParams('?email=ada%40example.org&requestId=forgot_123&verificationCode=654321')
    ).toEqual({
      email: 'ada@example.org',
      username: '',
      requestId: 'forgot_123',
      verificationCode: '654321',
    });
  });

  it('parses legacy aliases for reset-password links', () => {
    expect(
      parseResetLinkParams('?username=ada&request_id=forgot_abc&code=123456')
    ).toEqual({
      email: '',
      username: 'ada',
      requestId: 'forgot_abc',
      verificationCode: '123456',
    });
  });

  it('returns empty values when the link has no reset parameters', () => {
    expect(parseResetLinkParams('')).toEqual({
      email: '',
      username: '',
      requestId: '',
      verificationCode: '',
    });
  });
});
