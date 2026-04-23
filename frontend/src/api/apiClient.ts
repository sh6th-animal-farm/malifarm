import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL; // 백엔드 API 주소

// 1. 인스턴스 생성
const apiClient = axios.create({
  baseURL: `${baseURL}`,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// refresh 중복 호출 방지용
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('loginStartTime');
  localStorage.removeItem('lastActivityTime');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
};

const moveToLogin = () => {
  clearAuthStorage();
  window.location.href = '/auth/login';
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }

  // 같은 apiClient 말고 axios 직접 사용
  const response = await axios.post(
    `${baseURL}/api/auth/refresh`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    },
  );

  const res = response.data;

  if (!res.success) {
    throw new Error(res.message || '토큰 재발급에 실패했습니다.');
  }

  return res.data;
};

// 2. 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 토큰이 있다면 헤더에 추가
  }
  return config;
});

// 3. 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data; // ApiResponseDTO { success, message, data, error }

    // 성공
    if (res.success && res.message) {
      console.log(res.message);
    }

    // 실패
    // HttpStauts: 200 ok AND success: false
    if (!res.success) {
      const errorMsg = res.message || '요청 처리에 실패했습니다.';
      console.error(errorMsg);

      const customError = new Error(errorMsg) as Error & {
        response?: typeof response;
      };
      customError.response = response;
      return Promise.reject(customError);
    }

    return res.data;
  },

  async (error) => {
    const res = error.response?.data; // ApiResponseDTO { success, message, data, error }
    const originalRequest = error.config;

    if (res && !res.success) {
      const errorCode = res.error.code;
      const errorMsg = res.message;

      switch (errorCode) {
        case 'AUTH_003': {
          if (originalRequest?.url?.includes('/api/auth/refresh')) {
            console.error(errorMsg);
            moveToLogin();
            return Promise.reject(error);
          }

          if (originalRequest?._retry) {
            console.error(errorMsg);
            moveToLogin();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            if (isRefreshing) {
              return new Promise((resolve) => {
                subscribeTokenRefresh((newAccessToken: string) => {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  resolve(apiClient(originalRequest));
                });
              });
            }

            isRefreshing = true;

            const tokenData = await refreshAccessToken();

            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            localStorage.setItem('lastActivityTime', String(Date.now()));

            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;

            onRefreshed(tokenData.accessToken);
            return apiClient(originalRequest);
          } catch (refreshError) {
            refreshSubscribers = [];
            console.error('토큰 재발급 실패:', refreshError);
            moveToLogin();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        case 'EXTERNAL_001':
          // 외부 API 에러
          console.error(errorMsg);
          break;

        case 'EXTERNAL_004': {
          // 외부 API 잘못된 요청 주소 에러
          console.error(errorMsg);
          window.location.href = '/404';
          return Promise.reject(error);
        }

        case 'PROJECT_002':
          // 별(하트) 처리 실패
          console.error('관심 프로젝트 처리 실패:', errorMsg);
          break;

        default:
          // 그 외 에러
          console.error(errorMsg);
      }
    } else {
      console.error(
        '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
