import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/common/Button';
import Toast from '@/components/common/Toast';
import AdminSidebar from '@/pages/admin/AdminSidebar';
import type { ProjectDTO } from '@/types/projectType';
import '../../styles/admin.css';

interface CultivationData {
  projectId: number;
  managerCount: number;
  crop: string;
  expectedYield: number;
  actualYield?: number;
  plantingDate: string;
  harvestDate?: string;
  notes?: string;
}

const CultivationRegister: React.FC = () => {
  const [formData, setFormData] = useState<CultivationData>({
    projectId: 0,
    managerCount: 0,
    crop: '',
    expectedYield: 0,
    actualYield: 0,
    plantingDate: '',
    harvestDate: '',
    notes: '',
  });
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [toastMessage, setToastMessage] = useState('');

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
      await adminApi.insertCultivation(formData);
      setToastMessage('재배 정보 등록 완료');
    } catch (error) {
      setToastMessage('등록 실패');
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
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">재배 정보 등록</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">연관 프로젝트 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    대상 프로젝트 선택 (Project ID)
                  </label>
                  <select
                    name="projectId"
                    value={String(formData.projectId)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="0">선택</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName} ({project.projectRound ?? 0}차)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    현장 관리자 수 (Manager Count)
                  </label>
                  <input
                    type="number"
                    name="managerCount"
                    value={formData.managerCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">작물 및 생산 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    재배 작물 (Crop)
                  </label>
                  <input
                    type="text"
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    예상 생산량
                  </label>
                  <input
                    type="number"
                    name="expectedYield"
                    value={formData.expectedYield}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    실제 생산량
                  </label>
                  <input
                    type="number"
                    name="actualYield"
                    value={formData.actualYield}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">재배 일정 및 결과</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    파종/식재 일자
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    수확 일자
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">
                    비고 <span className="text-gray-500">(선택)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              재배 정보 저장하기
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CultivationRegister;
