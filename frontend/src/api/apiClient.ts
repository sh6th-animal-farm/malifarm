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

// 2. 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // 토큰이 있다면 헤더에 추가
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. 응답 인터셉터
// [TODO] alert > toast로 변환
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data; // ApiResponseDTO { success, message, data, error }

    // 성공
    if (res.success && res.message) {
      alert(res.message);
    }

    // 실패
    // HttpStauts: 200 ok AND success: false
    if (!res.success) {
      const errorMsg = res.message || '요청 처리에 실패했습니다.';
      alert(errorMsg);

      const error = new Error(errorMsg);
      error.response = response;
      return Promise.reject(error);
    }

    return res.data;
  },
  (error) => {
    const res = error.response?.data; // ApiResponseDTO { success, message, data, error }

    if (res && !res.success) {
      const errorCode = res.error.code;
      const errorMsg = res.message;

      switch (errorCode) {
        case 'AUTH_002': // NEED_LOGIN ("로그인이 필요한 서비스입니다.")
        case 'AUTH_003': // EXPIRED_TOKEN ("로그인 정보가 만료되었습니다. 다시 로그인해주세요.")
          alert(errorMsg);
          localStorage.removeItem('accessToken');
          window.location.href = '/auth/login';
          break;

        case 'EXTERNAL_001': // 외부 API 에러 ("외부 서비스 연동 중 오류가 발생했습니다.")
          alert(errorMsg);
          break;

        default:
          // 그 외 에러
          alert(errorMsg);
      }
    } else {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    return Promise.reject(error);
  },
);

export default apiClient;
