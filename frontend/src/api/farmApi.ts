import apiClient from './apiClient';

export const farmApi = {
  /**
   * 주소를 기반으로 위도(y), 경도(x) 좌표를 가져옵니다.
   * 백엔드: @GetMapping("/get-coords")
   * @param address 농장 주소
   */
  getCoords: (address: string) => {
    return apiClient.get(`/api/project/get-coords`, {
      params: { address },
    });
  },
};
