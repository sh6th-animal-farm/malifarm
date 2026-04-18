import { Link, useNavigate, useParams } from "react-router-dom";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Icon from "@/components/icon";

void Icon;

// Mock data (matches the list in index.tsx)
const mockNotices = [
  { 
    id: 20, 
    category: "공지", 
    title: "말리팜 서비스 이용약관 개정 안내", 
    date: "2026.04.09", 
    views: 842,
    content: "안녕하세요, 말리팜입니다.\n\n서비스 고도화 및 이용자 편의 향상을 위하여 이용약관을 개정하게 되었습니다.\n\n주요 개정 내용:\n1. 포인트 적립 및 사용 방식 변경\n2. 사용자 간 거래 수수료 면제 정책 도입\n3. 개인정보 처리방침 일부 명확화\n\n본 약관은 2026년 4월 20일부터 적용될 예정입니다.\n\n감사합니다." 
  },
  { 
    id: 19, 
    category: "점검", 
    title: "시스템 안정화 및 정기 점검 안내 (04/12)", 
    date: "2026.04.08", 
    views: 1521,
    content: "안정적인 서비스 제공을 위해 정기 점검이 진행될 예정입니다.\n\n* 점검 시간: 2026년 4월 12일 AM 02:00 ~ 06:00 (약 4시간)\n* 영향: 점검 시간 동안 서비스 접속 및 거래가 일시 중단됩니다.\n\n문의사항은 고객센터로 연락 부탁드립니다." 
  },
  { 
    id: 18, 
    category: "이벤트", 
    title: "[발표] 럭키드로우 당첨자 안내 (3월 2주차)", 
    date: "2024.03.11", 
    views: 1242,
    isWinnerEvent: true,
    content: "안녕하세요, 마리팜입니다. 🌿\n\n지속가능한 지구를 위한 마리팜 탄소마켓 럭키드로우에 참여해주신 모든 분들께 진심으로 감사드립니다.\n\n엄격하고 공정한 추첨을 통해 선정된 행운의 당첨자분들을 아래와 같이 발표합니다. 당첨되신 모든 분들 축하드립니다!\n\n당첨자분들께는 가입 시 등록한 이메일로 개별 안내가 발송되었습니다." 
  },
];

const winners = [
  { rank: "1등 (1명)", email: "mari****@naver.com", prize: "MacBook Pro 14 (M3)" },
  { rank: "2등 (1명)", email: "farm****@gmail.com", prize: "iPhone 15 Pro" },
  { rank: "3등 (1명)", email: "luck****@kakao.com", prize: "농작물 럭키박스" },
  { rank: "3등 (1명)", email: "test****@test.com", prize: "농작물 럭키박스" },
];

void winners;

const prizeInstructions = [
  "당첨 메일에 포함된 [배송지 입력 링크]를 통해 05월 10일(금)까지 정보를 입력해 주세요.",
  "기간 내 정보 미입력 시 당첨이 자동 취소될 수 있으니 유의 바랍니다.",
  "제세공과금 발생 경품은 안내된 절차에 따라 서류 제출이 필요합니다.",
];

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find notice by ID
  const notice = mockNotices.find((n) => n.id === Number(id)) || mockNotices[0];

  const badgeColors: Record<string, string> = {
    공지: "!bg-gray-900 !text-white",
    점검: "!bg-error/10 !text-error",
    이벤트: "!bg-info/10 !text-info",
    안내: "!bg-gray-100 !text-gray-500",
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[840px] px-6 py-[60px] pb-[100px]">
        {/* Category */}
        <div className="mb-6">
          <Badge 
            variant="default" 
            className={`!h-6 !min-w-[52px] !border-0 !rounded-full !text-[12px] !font-bold ${badgeColors[notice.category] || ""}`}
          >
            {notice.category}
          </Badge>
        </div>

        {/* Article Header */}
        <div className="flex flex-col gap-6 border-b border-gray-200 pb-9">
          <h1 className="font-header-03 text-gray-900 leading-tight">
            {notice.title}
          </h1>

          <div className="flex items-center gap-5">
            <span className="font-caption-01 text-gray-400">관리자</span>
            <span className="font-caption-01 text-gray-400">{notice.date}</span>
            <span className="font-caption-01 text-gray-400">조회수 {notice.views.toLocaleString()}</span>
          </div>
        </div>

        {/* Article Body */}
        <div className="flex flex-col gap-8 py-10">
          <div className="whitespace-pre-line font-body-01 leading-relaxed text-gray-700">
            {notice.content}
          </div>

          {/* Conditional Winner Section (Only for event 18) */}
          {notice.isWinnerEvent && (
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10 flex flex-col gap-6 border border-gray-100/50">
              <h3 className="text-[18px] font-bold text-gray-900">
                경품 수령 안내
              </h3>
              <ul className="flex flex-col gap-4">
                {prizeInstructions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 pl-1">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                    <span className="text-[16px] font-normal leading-relaxed text-gray-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Post Navigation */}
        <div className="mt-12 border-t border-gray-100">
          <div className="flex items-center gap-4 py-5 border-b border-gray-100 group">
            <span className="w-16 shrink-0 font-caption-02 text-gray-400">다음글</span>
            <Link
              to={`/notice/${notice.id + 1}`}
              className="flex-1 font-caption-02 text-gray-700 hover:text-green-600 transition-colors truncate"
            >
              [안내] 4월 탄소 저감 프로젝트 참여 농장 모집
            </Link>
          </div>
          <div className="flex items-center gap-4 py-5 border-b border-gray-100 group">
            <span className="w-16 shrink-0 font-caption-02 text-gray-400">이전글</span>
            <Link
              to={`/notice/${notice.id - 1}`}
              className="flex-1 font-caption-02 text-gray-700 hover:text-green-600 transition-colors truncate"
            >
              [공지] 마리팜 서비스 점검 안내 (03/05)
            </Link>
          </div>
        </div>

        {/* List Button */}
        <div className="mt-16 flex justify-center">
          <Button
            onClick={() => navigate("/notice")}
            className="!w-40 !h-12 !rounded-full !bg-white !border !border-gray-200 !text-gray-600 hover:!bg-gray-50 hover:!border-gray-300"
          >
            목록으로
          </Button>
        </div>
      </div>
    </main>
  );
}
