import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/common/Button';
import Toast from '@/components/common/Toast';
import AdminSidebar from '@/components/common/AdminSidebar';
import '../../styles/admin.css';

interface ExpenseData {
  projectId: number;
  recordedBy: string;
  category: string;
  subCategory: string;
  amount: number;
  startDate: string;
  endDate: string;
  vendor: string;
  description?: string;
}

interface Project {
  projectId: number;
  projectName: string;
  projectRound: number;
}

const ExpenseRegister: React.FC = () => {
  const [formData, setFormData] = useState<ExpenseData>({
    projectId: 0,
    recordedBy: 'admin', // 기본값
    category: '',
    subCategory: '',
    amount: 0,
    startDate: '',
    endDate: '',
    vendor: '',
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
      await adminApi.insertExpense(formData);
      Toast.show('지출 데이터 기록 완료');
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
          <h1 className="text-3xl font-bold mb-8">지출 정보 등록</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">지출 발생 프로젝트</h2>
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
                    <option value="0">
                      지출이 발생한 프로젝트를 선택하세요
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
              <h2 className="text-xl font-semibold mb-4">지출 상세 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    지출 카테고리
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">대분류 선택</option>
                    <option value="인건비">인건비</option>
                    <option value="재료비">재료비</option>
                    <option value="설비비">설비비</option>
                    <option value="유지보수비">유지보수비</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    세부 항목 (Sub Category)
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="예: 전기료, 종자구입비"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    지출 금액 (Amount)
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    지출 시작일
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
                    지출 종료일
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
                    결제처/거래처 (Vendor)
                  </label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="예: 한국전력, OO종묘"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">
                    지출 상세 설명 <span className="text-gray-500">(선택)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="지출 증빙 번호나 구체적인 사유를 입력하세요."
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              지출 데이터 기록 완료
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ExpenseRegister;
