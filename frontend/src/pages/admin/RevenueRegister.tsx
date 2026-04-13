import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/common/Button';
import Toast from '@/components/common/Toast';
import AdminSidebar from '@/pages/admin/AdminSidebar';
import '../../styles/admin.css';

interface RevenueData {
  projectId: number;
  recordedBy: string;
  startDate: string;
  endDate: string;
  amount: number;
  description?: string;
}

interface Project {
  projectId: number;
  projectName: string;
  projectRound: number;
}

const RevenueRegister: React.FC = () => {
  const [formData, setFormData] = useState<RevenueData>({
    projectId: 0,
    recordedBy: 'admin', // 기본값
    startDate: '',
    endDate: '',
    amount: 0,
    description: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await adminApi.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
      }
    };
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.insertRevenue(formData);
      Toast.show('수익 데이터 기록 완료');
    } catch (error) {
      Toast.show('기록 실패');
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

  return (
    <div className="admin-layout min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">수익 정보 등록</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">수익 발생 프로젝트</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    프로젝트 선택 (Project ID)
                  </label>
                  <select
                    name="projectId"
                    value={String(formData.projectId)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value={0}>
                      수익이 발생한 프로젝트를 선택하세요
                    </option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName} ({project.projectRound}차)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    기록자 (Recorded By)
                  </label>
                  <input
                    type="text"
                    name="recordedBy"
                    value={formData.recordedBy}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">수익 상세 내용</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    수익 발생 시작일
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    수익 발생 종료일
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    수익 금액 (Amount)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="단위: KRW"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">
                    수익 내용 설명 <span className="text-gray-500">(선택)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded"
                    placeholder="예: 2026년 1분기 토마토 판매 대금 및 탄소배출권 매각 수익"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              수익 데이터 기록 완료
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RevenueRegister;
