/**
 * 농가 환경 데이터 DTO
 */
export interface FarmEnvDataDTO {
  feId: number; // 환경 데이터 ID (PK)
  farmId: number; // 농가 ID (FK)

  // 내부 환경 정보
  humidityInside: number; // 내부 습도 (%)
  temperatureInside: number; // 내부 온도 (℃)

  // 일사량 정보
  solarRadiation: number; // 일사량 (W/㎡)

  // 외부 환경 정보
  humidityOutside: number; // 외부 습도 (%)
  temperatureOutside: number; // 외부 온도 (℃)

  createdAt: string; // 데이터 수집 시점
}

/**
 * 농가 정보 DTO (환경 데이터 포함)
 */
export interface FarmDTO {
  farmId: number;
  farmName: string;

  // 주소 및 위치
  addressSido: string;
  addressSigungu: string;
  addressStreet: string;
  addressDetails: string;
  latitude: number;
  longitude: number;
  altitude: number;

  // 농가 상세
  farmType: string;
  area: number;
  description: string;
  thumbnailUrl: string;
  openAt: string;

  // 관계 데이터: 해당 농가의 환경 데이터 리스트
  envDatas?: FarmEnvDataDTO[];
}
