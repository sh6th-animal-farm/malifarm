import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Toast from '@/components/common/Toast';
import AdminSidebar from '@/pages/admin/AdminSidebar';
import '../../styles/admin.css';

interface FarmData {
  farmName: string;
  farmType: string;
  area: number;
  openAt: string;
  addressSido: string;
  addressSigungu: string;
  addressStreet: string;
  latitude: number;
  longitude: number;
  altitude: number;
  description?: string;
}

declare global {
  interface Window {
    daum: any;
  }
}

const FarmRegister: React.FC = () => {
  const [formData, setFormData] = useState<FarmData>({
    farmName: '',
    farmType: '',
    area: 0,
    openAt: '',
    addressSido: '',
    addressSigungu: '',
    addressStreet: '',
    latitude: 0,
    longitude: 0,
    altitude: 0,
    description: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // daum Postcode 스크립트 로드
    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminApi.insertFarm(formData);
      if (response === 'success') {
        Toast.show('농장 등록이 완료되었습니다!');
        // 리다이렉트 로직 추가 가능
      } else {
        Toast.show('등록 실패: ' + response);
      }
    } catch (error) {
      console.error(error);
      Toast.show('등록 실패');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const searchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        setFormData({
          ...formData,
          addressSido: data.sido,
          addressSigungu: data.sigungu,
          addressStreet: data.roadAddress,
        });
        fetchCoordsFromServer(data.roadAddress);
      },
    }).open();
  };

  const fetchCoordsFromServer = async (address: string) => {
    try {
      const coords = await adminApi.getCoords(address);
      if (coords) {
        setFormData({
          ...formData,
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: coords.altitude || 0,
        });
        Toast.show('위치 좌표가 자동으로 설정되었습니다.');
      }
    } catch (error) {
      console.error('좌표 로드 실패:', error);
      Toast.show('좌표를 가져오지 못했습니다. 수동 입력을 권장합니다.');
    }
  };

  return (
    <div className="admin-layout min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">농장 등록/수정</h1>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              농장 정보 불러오기
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    농장 명칭
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="예: 청라 토마토 1호 농장"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    농장 유형
                  </label>
                  <select
                    name="farmType"
                    value={formData.farmType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">선택</option>
                    <option value="토마토">토마토</option>
                    <option value="오이">오이</option>
                    <option value="상추">상추</option>
                    <option value="딸기">딸기</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    재배 면적 (㎡)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    개설 일자
                  </label>
                  <input
                    type="date"
                    name="openAt"
                    value={formData.openAt}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    농장 소개 <span className="text-gray-500">(선택)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="농장의 특징 및 시설 정보를 입력하세요."
                  />
                </div>
              </div>
            </div>
            {/* 위치 정보 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">위치 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    시/도
                  </label>
                  <input
                    type="text"
                    name="addressSido"
                    value={formData.addressSido}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    시/군/구
                  </label>
                  <input
                    type="text"
                    name="addressSigungu"
                    value={formData.addressSigungu}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    도로명 주소
                  </label>
                  <input
                    type="text"
                    name="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    name="detailedAddress"
                    className="w-full p-2 border rounded"
                    placeholder="상세 주소"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">위도</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">경도</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">고도</label>
                  <input
                    type="number"
                    step="any"
                    name="altitude"
                    value={formData.altitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={searchAddress}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    주소 검색
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              농장 등록 완료
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FarmRegister;
