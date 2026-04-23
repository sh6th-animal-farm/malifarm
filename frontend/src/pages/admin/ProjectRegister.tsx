import React, { useState, useRef, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/common/Button';
import AdminSidebar from '@/pages/admin/AdminSidebar';
import type { ProjectDTO } from '@/types/projectType';
import '../../styles/admin.css';

interface ProjectFormData {
  projectId: number;
  farmId: number;
  projectName: string;
  projectRound: number;
  projectDescription: string;
  tokenName: string;
  tokenSymbol: string;
  tickerSymbol: string;
  targetAmount: number;
  totalSupply: number;
  minAmountPerInvestor: number;
  maxAmountPerInvestor: number;
  actualAmount: number;
  expectedReturn: number;
  roi: number;
  managerCount: number;
  announcementStartDate: string;
  announcementEndDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  resultAnnouncementDate: string;
  projectStartDate: string;
  projectEndDate: string;
  images: string[];
  subscriptionRate: number;
  projectStatus:
    | 'ANNOUNCEMENT'
    | 'SUBSCRIPTION'
    | 'INPROGRESS'
    | 'CANCELED'
    | 'COMPLETED';
  method: string;
  crop?: string;
  temperatureInside: number[];
  humidityInside: number[];

  farm: {
    addressSido: string;
    area: number;
  };
  projectImages?: File[];
  deletedPictureIds?: number[];
}

interface AdminProject {
  projectId: number;
  projectName: string;
  projectRound: number;
  farmId: number;
  targetAmount: number;
  minAmountPerInvestor: number;
  maxAmountPerInvestor?: number;
  actualAmount?: number;
  expectedReturn: number;
  roi?: number;
  managerCount: number;
  announcementStartDate: string;
  announcementEndDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  resultAnnouncementDate: string;
  projectStartDate: string;
  projectEndDate: string;
  tokenName?: string;
  tokenSymbol?: string;
  tickerSymbol?: string;
  totalSupply?: number;
}
interface Farm {
  farmId: number;
  farmName: string;
}

const toAdminProject = (project: ProjectDTO): AdminProject => ({
  projectId: project.projectId,
  projectName: project.projectName,
  projectRound: project.projectRound ?? 0,
  farmId: 0,
  targetAmount: 0,
  minAmountPerInvestor: 0,
  maxAmountPerInvestor: 0,
  actualAmount: 0,
  expectedReturn: project.expectedReturn ?? 0,
  roi: 0,
  managerCount: 0,
  announcementStartDate: project.announcementStartDate ?? '',
  announcementEndDate: project.announcementEndDate ?? '',
  subscriptionStartDate: project.subscriptionStartDate ?? '',
  subscriptionEndDate: project.subscriptionEndDate ?? '',
  resultAnnouncementDate: '',
  projectStartDate: project.projectStartDate ?? '',
  projectEndDate: project.projectEndDate ?? '',
  tokenName: '',
  tokenSymbol: '',
  tickerSymbol: '',
  totalSupply: 0,
});

const createInitialFormData = (): ProjectFormData => ({
  projectId: 0,
  farmId: 0,
  projectName: '',
  projectRound: 1,
  projectDescription: '',
  tokenName: '',
  tokenSymbol: '',
  tickerSymbol: '',
  targetAmount: 0,
  totalSupply: 0,
  minAmountPerInvestor: 0,
  maxAmountPerInvestor: 0,
  actualAmount: 0,
  expectedReturn: 0,
  roi: 0,
  managerCount: 0,
  announcementStartDate: '',
  announcementEndDate: '',
  subscriptionStartDate: '',
  subscriptionEndDate: '',
  resultAnnouncementDate: '',
  projectStartDate: '',
  projectEndDate: '',
  images: [],
  subscriptionRate: 0,
  projectStatus: 'ANNOUNCEMENT',
  method: '',
  crop: '',
  temperatureInside: [],
  humidityInside: [],
  farm: {
    addressSido: '',
    area: 0,
  },
  projectImages: [],
  deletedPictureIds: [],
});

const commaNumberFields = new Set([
  'targetAmount',
  'totalSupply',
  'minAmountPerInvestor',
  'maxAmountPerInvestor',
  'actualAmount',
]);

const ProjectRegister: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>(
    createInitialFormData(),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const result = await adminApi.getProjects();
        setProjects(result.map(toAdminProject));
      } catch (error) {
        console.error('프로젝트 로드 실패:', error);
        setProjects([]);
      }
    };
    const loadFarms = async () => {
      try {
        const result = await adminApi.getFarms();
        setFarms(result);
      } catch (error) {
        console.error('농장 로드 실패:', error);
        setFarms([]);
      }
    };
    loadProjects();
    loadFarms();
  }, []);

  const resetForm = () => {
    setFormData(createInitialFormData());
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const form = new FormData();

    // 필수 필드 추가
    form.append('farmId', String(formData.farmId));
    form.append('projectName', formData.projectName);
    form.append('projectRound', String(formData.projectRound));
    form.append('projectDescription', formData.projectDescription);
    form.append('targetAmount', String(parseNumberInput(formData.targetAmount)));
    form.append(
      'minAmountPerInvestor',
      String(parseNumberInput(formData.minAmountPerInvestor)),
    );
    form.append('expectedReturn', String(formData.expectedReturn));
    form.append('managerCount', String(formData.managerCount));
    form.append(
      'announcementStartDate',
      toBackendDateTime(formData.announcementStartDate),
    );
    form.append(
      'announcementEndDate',
      toBackendDateTime(formData.announcementEndDate),
    );
    form.append(
      'subscriptionStartDate',
      toBackendDateTime(formData.subscriptionStartDate),
    );
    form.append(
      'subscriptionEndDate',
      toBackendDateTime(formData.subscriptionEndDate),
    );
    form.append(
      'resultAnnouncementDate',
      toBackendDateTime(formData.resultAnnouncementDate),
    );
    form.append(
      'projectStartDate',
      toBackendDateTime(formData.projectStartDate),
    );
    form.append('projectEndDate', toBackendDateTime(formData.projectEndDate));

    // 선택적 필드
    form.append('tokenName', formData.tokenName);
    form.append('tickerSymbol', formData.tickerSymbol || '');
    form.append('totalSupply', String(parseNumberInput(formData.totalSupply)));
    form.append(
      'maxAmountPerInvestor',
      String(parseNumberInput(formData.maxAmountPerInvestor)),
    );
    form.append('actualAmount', String(parseNumberInput(formData.actualAmount)));

    // 이미지 파일 추가
    if (formData.projectImages && formData.projectImages.length > 0) {
      formData.projectImages.forEach((file) => {
        form.append(`projectImages`, file);
      });
    }

    try {
      await adminApi.insertProject(form);
      console.log('프로젝트 등록 완료');
      alert('프로젝트가 등록되었습니다!');
      resetForm();
    } catch (error) {
      console.log('등록 실패:', error);
      const errorMsg =
        (error as any)?.response?.data ||
        (error as Error)?.message ||
        '프로젝트 등록 중 오류가 발생했습니다.';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const form = new FormData();

    // 필수 필드 추가
    form.append('projectId', String(formData.projectId));
    form.append('farmId', String(formData.farmId));
    form.append('projectName', formData.projectName);
    form.append('projectRound', String(formData.projectRound));
    form.append('projectDescription', formData.projectDescription);
    form.append('targetAmount', String(parseNumberInput(formData.targetAmount)));
    form.append(
      'minAmountPerInvestor',
      String(parseNumberInput(formData.minAmountPerInvestor)),
    );
    form.append('expectedReturn', String(formData.expectedReturn));
    form.append('managerCount', String(formData.managerCount));
    form.append(
      'announcementStartDate',
      toBackendDateTime(formData.announcementStartDate),
    );
    form.append(
      'announcementEndDate',
      toBackendDateTime(formData.announcementEndDate),
    );
    form.append(
      'subscriptionStartDate',
      toBackendDateTime(formData.subscriptionStartDate),
    );
    form.append(
      'subscriptionEndDate',
      toBackendDateTime(formData.subscriptionEndDate),
    );
    form.append(
      'resultAnnouncementDate',
      toBackendDateTime(formData.resultAnnouncementDate),
    );
    form.append(
      'projectStartDate',
      toBackendDateTime(formData.projectStartDate),
    );
    form.append('projectEndDate', toBackendDateTime(formData.projectEndDate));

    // 선택적 필드
    form.append('tokenName', formData.tokenName);
    form.append('tickerSymbol', formData.tickerSymbol || '');
    form.append('totalSupply', String(parseNumberInput(formData.totalSupply)));
    form.append(
      'maxAmountPerInvestor',
      String(parseNumberInput(formData.maxAmountPerInvestor)),
    );
    form.append('actualAmount', String(parseNumberInput(formData.actualAmount)));

    // 이미지 파일 추가
    if (formData.projectImages && formData.projectImages.length > 0) {
      formData.projectImages.forEach((file) => {
        form.append(`projectImages`, file);
      });
    }

    // 삭제된 이미지 ID
    if (formData.deletedPictureIds && formData.deletedPictureIds.length > 0) {
      form.append(
        'deletedPictureIds',
        JSON.stringify(formData.deletedPictureIds),
      );
    }

    try {
      await adminApi.updateProject(form);
      console.log('프로젝트 수정 완료');
      alert('프로젝트가 수정되었습니다!');
    } catch (error) {
      console.log('수정 실패:', error);
      const errorMsg =
        (error as any)?.response?.data ||
        (error as Error)?.message ||
        '프로젝트 수정 중 오류가 발생했습니다.';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseNumberInput = (value: any) => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/,/g, '')) || 0;
    }
    return value || 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === 'number' || commaNumberFields.has(name)
        ? parseNumberInput(value)
        : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const renderNumberValue = (value: any) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const toInputDateTime = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const toBackendDateTime = (dateString: string): string => {
    if (!dateString) return '';
    // dateString 형식: "2026-04-02T09:00"
    // 타임존 오프셋 계산 (한국: +09:00)
    const offset = new Date().getTimezoneOffset();
    const hours = String(Math.abs(Math.floor(offset / 60))).padStart(2, '0');
    const minutes = String(Math.abs(offset % 60)).padStart(2, '0');
    const sign = offset <= 0 ? '+' : '-';
    const tzString = `${sign}${hours}:${minutes}`;
    // 초 추가: "2026-04-02T09:00:00+09:00"
    return `${dateString}:00${tzString}`;
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      const result = await adminApi.getProjects();
      setProjects(result.map(toAdminProject));
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project: AdminProject) => {
    setLoading(true);
    try {
      const detail = await adminApi.getProjectDetails(project.projectId);
      const selected = detail as any;

      // 토큰 정보 별도로 불러오기
      let tokenInfo: any = null;
      try {
        const tokenResult = await adminApi.getTokens(project.projectId);
        console.log('📦 토큰 정보 응답:', tokenResult);
        tokenInfo = tokenResult as any;
      } catch (e) {
        console.log('❌ 토큰 정보 로드 실패:', e);
      }

      console.log('📋 프로젝트 상세 정보:', selected);
      console.log('🎫 토큰 정보:', tokenInfo);
      console.log(
        '선택 우선순위 - tokenName:',
        tokenInfo?.tokenName || selected.tokenName,
      );
      console.log(
        '선택 우선순위 - tickerSymbol:',
        tokenInfo?.tickerSymbol || selected.tickerSymbol,
      );

      setFormData({
        ...formData,
        projectId: selected.projectId ?? project.projectId,
        farmId: selected.farmId ?? project.farmId,
        projectName: selected.projectName ?? project.projectName,
        projectRound: selected.projectRound ?? project.projectRound,
        projectDescription: selected.projectDescription ?? '',
        tokenName:
          tokenInfo?.tokenName || selected.tokenName || formData.tokenName,
        tokenSymbol:
          tokenInfo?.tickerSymbol ||
          selected.tickerSymbol ||
          project.tickerSymbol ||
          '',
        tickerSymbol:
          tokenInfo?.tickerSymbol ||
          selected.tickerSymbol ||
          project.tickerSymbol ||
          '',
        targetAmount: Number(
          selected.targetAmount ?? project.targetAmount ?? 0,
        ),
        totalSupply: Number(
          tokenInfo?.totalSupply ??
            selected.totalSupply ??
            project.totalSupply ??
            0,
        ),
        minAmountPerInvestor: Number(
          selected.minAmountPerInvestor ?? project.minAmountPerInvestor ?? 0,
        ),
        maxAmountPerInvestor: Number(
          selected.maxAmountPerInvestor ?? project.maxAmountPerInvestor ?? 0,
        ),
        actualAmount: Number(
          selected.actualAmount ?? project.actualAmount ?? 0,
        ),
        subscriptionRate: Number(
          selected.subscriptionRate ?? formData.subscriptionRate ?? 0,
        ),
        projectStatus: (selected.projectStatus ??
          formData.projectStatus) as ProjectFormData['projectStatus'],
        announcementStartDate: toInputDateTime(selected.announcementStartDate),
        announcementEndDate: toInputDateTime(selected.announcementEndDate),
        subscriptionStartDate: toInputDateTime(selected.subscriptionStartDate),
        subscriptionEndDate: toInputDateTime(selected.subscriptionEndDate),
        resultAnnouncementDate: toInputDateTime(
          selected.resultAnnouncementDate,
        ),
        projectStartDate: toInputDateTime(selected.projectStartDate),
        projectEndDate: toInputDateTime(selected.projectEndDate),
        expectedReturn: Number(
          selected.expectedReturn ?? project.expectedReturn ?? 0,
        ),
        roi: Number(selected.roi ?? selected.expectedReturn ?? 0),
        managerCount: Number(
          selected.managerCount ?? project.managerCount ?? 0,
        ),
        method: selected.method || '',
        crop: selected.crop || '',
        temperatureInside: Array.isArray(selected.temperatureInside)
          ? selected.temperatureInside.map((value: any) => Number(value))
          : [],
        humidityInside: Array.isArray(selected.humidityInside)
          ? selected.humidityInside.map((value: any) => Number(value))
          : [],
        images: Array.isArray(selected.images) ? selected.images : [],
        farm: {
          addressSido: selected.farm?.addressSido || formData.farm.addressSido,
          area: Number(selected.farm?.area ?? formData.farm.area ?? 0),
        },
      });
      setImagePreviews(Array.isArray(selected.images) ? selected.images : []);
    } catch (error) {
      console.error('프로젝트 상세 로드 실패:', error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setImagePreviews([...imagePreviews, ...newPreviews]);
      setFormData({
        ...formData,
        projectImages: [
          ...(formData.projectImages || []),
          ...Array.from(files),
        ],
      });
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    const newImages = formData.projectImages?.filter((_, i) => i !== index);
    setFormData({ ...formData, projectImages: newImages });
  };

  return (
    <div className="admin-layout min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">프로젝트 등록/수정</h1>
            <Button
              onClick={openModal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              프로젝트 정보 불러오기
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    농장 선택 (Farm ID)
                  </label>
                  <select
                    name="farmId"
                    value={String(formData.farmId)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="0">선택</option>
                    {farms.map((farm) => (
                      <option key={farm.farmId} value={farm.farmId}>
                        {farm.farmName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    프로젝트 명
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    프로젝트 차수 (Round)
                  </label>
                  <input
                    type="number"
                    name="projectRound"
                    value={formData.projectRound}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">
                    프로젝트 상세 설명{' '}
                    <span className="text-gray-500">(선택)</span>
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            {/* 투자 설정 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">투자 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    토큰 명칭
                  </label>
                  <input
                    type="text"
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    종목 코드 (Ticker)
                  </label>
                  <input
                    type="text"
                    name="tickerSymbol"
                    value={formData.tickerSymbol}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    목표 금액
                  </label>
                  <input
                    type="text"
                    name="targetAmount"
                    value={renderNumberValue(formData.targetAmount)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    토큰 총 발행량
                  </label>
                  <input
                    type="text"
                    name="totalSupply"
                    value={renderNumberValue(formData.totalSupply)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    1인당 최소 투자금
                  </label>
                  <input
                    type="text"
                    name="minAmountPerInvestor"
                    value={renderNumberValue(formData.minAmountPerInvestor)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    현재 모집 금액 <span className="text-gray-500">(선택)</span>
                  </label>
                  <input
                    type="text"
                    name="actualAmount"
                    value={renderNumberValue(formData.actualAmount)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    청약률
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="subscriptionRate"
                    value={formData.subscriptionRate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            {/* 일정 및 기타 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">일정 및 기타</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    공고 시작일
                  </label>
                  <input
                    type="datetime-local"
                    name="announcementStartDate"
                    value={formData.announcementStartDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    공고 종료일
                  </label>
                  <input
                    type="datetime-local"
                    name="announcementEndDate"
                    value={formData.announcementEndDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    청약 시작일
                  </label>
                  <input
                    type="datetime-local"
                    name="subscriptionStartDate"
                    value={formData.subscriptionStartDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    청약 종료일
                  </label>
                  <input
                    type="datetime-local"
                    name="subscriptionEndDate"
                    value={formData.subscriptionEndDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    결과 발표일
                  </label>
                  <input
                    type="datetime-local"
                    name="resultAnnouncementDate"
                    value={formData.resultAnnouncementDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    1인당 최대 투자금
                  </label>
                  <input
                    type="text"
                    name="maxAmountPerInvestor"
                    value={renderNumberValue(formData.maxAmountPerInvestor)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    예상 수익률 (ROI) %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="expectedReturn"
                    value={formData.expectedReturn}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    사업 시작일
                  </label>
                  <input
                    type="datetime-local"
                    name="projectStartDate"
                    value={formData.projectStartDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    사업 종료일
                  </label>
                  <input
                    type="datetime-local"
                    name="projectEndDate"
                    value={formData.projectEndDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    현장 관리자 수
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    재배 방식
                  </label>
                  <input
                    type="text"
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    작물 종류
                  </label>
                  <input
                    type="text"
                    name="crop"
                    value={formData.crop || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            {/* 프로젝트 이미지 */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">
                프로젝트 이미지 등록
              </h2>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt="preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-2xl text-gray-400">+</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                className="hidden"
              />
            </div>
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold text-lg flex-1"
                disabled={isSubmitting}
              >
                프로젝트 등록
              </Button>
              <Button
                type="button"
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg flex-1"
                disabled={isSubmitting}
              >
                프로젝트 수정
              </Button>
            </div>
          </form>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  지난 프로젝트 목록 선택
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">로딩 중...</div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">프로젝트 목록이 없습니다.</div>
                </div>
              ) : (
                <ul className="space-y-2 overflow-y-auto flex-1 border rounded-lg p-2">
                  {projects.map((project) => (
                    <li
                      key={project.projectId}
                      className="p-3 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition"
                      onClick={() => selectProject(project)}
                    >
                      <strong className="text-gray-800">
                        {project.projectName} ({project.projectRound}차)
                      </strong>
                      <br />
                      <small className="text-gray-600">
                        ID: {project.projectId} | 목표액:{' '}
                        {project.targetAmount?.toLocaleString?.() || 0}원 |
                        예상수익: {project.expectedReturn}%
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectRegister;
