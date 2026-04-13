import apiClient from './apiClient';

export const authApi = {
  getUser: () => {
    return apiClient.get('/api/user/me');
  },
  getUserName: (): Promise<string> => {
    return apiClient.get('/api/user/me/name');
  },
  getUserRole: (): Promise<string> => {
    return apiClient.get('/api/user/me/role');
  },
  sendPasswordResetCode: (email: string) => {
    return apiClient.post('/api/auth/password/reset/code', { email });
  },
  verifyPasswordResetCode: (email: string, code: string) => {
    return apiClient.post('/api/auth/password/reset/verify', { email, code });
  },
  resetPassword: (
    email: string,
    verificationCode: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return apiClient.post('/api/auth/password/reset', {
      email,
      verificationCode,
      newPassword,
      confirmPassword,
    });
  },
};
