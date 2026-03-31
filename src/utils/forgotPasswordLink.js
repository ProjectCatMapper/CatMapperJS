export const parseResetLinkParams = (search) => {
  const params = new URLSearchParams(search || '');
  return {
    email: params.get('email')?.trim() || '',
    username: (params.get('user') || params.get('username') || '').trim(),
    requestId: (params.get('requestId') || params.get('request_id') || '').trim(),
    verificationCode: (
      params.get('verificationCode')
      || params.get('verification_code')
      || params.get('code')
      || params.get('token')
      || ''
    ).trim(),
  };
};
