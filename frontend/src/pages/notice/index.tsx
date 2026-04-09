import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/layout/SectionHeader";

const showcaseItems = [
  {
    id: 1,
    title: "딸기 스마트팜 4호",
    status: "SUBSCRIPTION",
    location: "경기 화성",
    upperDate: "2026.04.08 ~ 2026.04.19",
    lowerDate: "2026.05.01 ~ 2026.11.30",
    timerLabel: "마감까지",
    timerValue: "18:42:19",
    percent: 62,
    returnRate: "연 12.8%",
    actionLabel: "청약 하기",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "청년농 토마토팜 2차",
    status: "SUBSCRIPTION",
    location: "충남 논산",
    upperDate: "2026.04.10 ~ 2026.04.22",
    lowerDate: "2026.05.10 ~ 2026.12.20",
    timerLabel: "마감까지",
    timerValue: "43:11:07",
    percent: 78,
    returnRate: "연 13.6%",
    actionLabel: "청약 하기",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "수경재배 허브온실 1호",
    status: "SUBSCRIPTION",
    location: "전북 김제",
    upperDate: "2026.04.11 ~ 2026.04.25",
    lowerDate: "2026.05.15 ~ 2026.10.31",
    timerLabel: "마감까지",
    timerValue: "72:03:51",
    percent: 39,
    returnRate: "연 11.9%",
    actionLabel: "청약 하기",
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "유기농 상추밭 프로젝트",
    status: "ANNOUNCEMENT",
    location: "강원 춘천",
    upperDate: "2026.04.26 ~ 2026.05.08",
    lowerDate: "2026.05.12 ~ 2026.11.12",
    timerLabel: "시작까지",
    timerValue: "03일 12:15",
    percent: 0,
    returnRate: "연 14.2%",
    actionLabel: "공고 보기",
    image:
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "AI 파프리카팜 6호",
    status: "ANNOUNCEMENT",
    location: "전남 나주",
    upperDate: "2026.04.29 ~ 2026.05.13",
    lowerDate: "2026.05.20 ~ 2026.12.20",
    timerLabel: "시작까지",
    timerValue: "05일 08:40",
    percent: 0,
    returnRate: "연 15.1%",
    actionLabel: "공고 보기",
    image:
      "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    title: "버섯 재배 단지 3차",
    status: "ANNOUNCEMENT",
    location: "경북 상주",
    upperDate: "2026.05.02 ~ 2026.05.16",
    lowerDate: "2026.05.20 ~ 2027.01.30",
    timerLabel: "시작까지",
    timerValue: "08일 21:03",
    percent: 0,
    returnRate: "연 13.4%",
    actionLabel: "공고 보기",
    image:
      "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    title: "시설오이 스마트팜 5호",
    status: "INPROGRESS",
    location: "경남 밀양",
    upperDate: "",
    lowerDate: "2026.03.01 ~ 2026.10.31",
    timerLabel: "",
    timerValue: "",
    percent: 0,
    returnRate: "연 9.8%",
    actionLabel: "토큰 구매",
    image:
      "https://images.unsplash.com/photo-1463123081488-789f998ac9c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 8,
    title: "딸기 수출형 온실 2호",
    status: "INPROGRESS",
    location: "충북 진천",
    upperDate: "",
    lowerDate: "2026.02.18 ~ 2026.12.15",
    timerLabel: "",
    timerValue: "",
    percent: 0,
    returnRate: "연 10.6%",
    actionLabel: "토큰 구매",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 9,
    title: "친환경 곡물단지 1호",
    status: "INPROGRESS",
    location: "전북 익산",
    upperDate: "",
    lowerDate: "2026.01.20 ~ 2026.09.20",
    timerLabel: "",
    timerValue: "",
    percent: 0,
    returnRate: "연 11.3%",
    actionLabel: "토큰 구매",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
];

function ShowcaseCard({
  tone,
  title,
  status,
  location,
  upperDate,
  lowerDate,
  timerLabel,
  timerValue,
  percent,
  returnRate,
  actionLabel,
  image,
}: {
  tone: "soft" | "float";
  title: string;
  status: "SUBSCRIPTION" | "ANNOUNCEMENT" | "INPROGRESS";
  location: string;
  upperDate: string;
  lowerDate: string;
  timerLabel: string;
  timerValue: string;
  percent: number;
  returnRate: string;
  actionLabel: string;
  image: string;
}) {
  const cardToneClass =
    tone === "soft"
      ? "bg-white shadow-weak"
      : "bg-white shadow-strong";

  const isSubscription = status === "SUBSCRIPTION";
  const isAnnouncement = status === "ANNOUNCEMENT";

  const badgeToneClass = isSubscription
    ? "bg-warning-light text-warning"
    : isAnnouncement
      ? "bg-info-light text-info"
      : "bg-green-0 text-green-700";

  const badgeLabel = isSubscription
    ? "청약중"
    : isAnnouncement
      ? "공고중"
      : "진행중";

  const actionToneClass = isSubscription
    ? "bg-gray-900 text-white hover:bg-warning"
    : isAnnouncement
      ? "bg-gray-900 text-white hover:bg-info"
      : "bg-gray-900 text-white hover:bg-green-600";

  return (
    <article
      className={`flex min-h-[420px] flex-col overflow-hidden rounded-[30px] ${cardToneClass}`}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <div className="absolute left-5 top-5">
          <span
            className={`inline-flex rounded-full px-3 py-1 font-caption-02 ${badgeToneClass}`}
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-header-04 text-gray-900">{title}</h3>
        <p className="mt-2 font-body-01 text-gray-500">{location}</p>

        {status !== "INPROGRESS" ? (
          <div className="mt-4 flex items-start justify-between gap-3 font-caption-01 text-gray-500">
            <span>{upperDate}</span>
            <span className="text-right">
              <strong className="mr-1 text-error">{timerLabel}</strong>
              <strong className="text-error">{timerValue}</strong>
            </span>
          </div>
        ) : null}

        {isSubscription ? (
          <div className="mt-5">
            <div className="mb-2 inline-flex items-end gap-1 text-green-600">
              <strong className="font-body-03">{percent}% 모집</strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-600"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2 font-caption-01 text-gray-500">
            <p className="flex items-start justify-between gap-3">
              <span>{isAnnouncement ? "청약 예정일" : "운영 기간"}</span>
              <strong className="text-right text-gray-800">{lowerDate}</strong>
            </p>
            <p className="flex items-start justify-between gap-3">
              <span>{isAnnouncement ? "예상 수익률" : "현재 수익률"}</span>
              <strong className="text-gray-800">{returnRate}</strong>
            </p>
          </div>
        )}

        <div className="mt-auto pt-5">
          <button
            type="button"
            className={`inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-s)] font-button-01 transition-colors duration-200 ${actionToneClass}`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

function ShowcaseSection({
  title,
  description,
  sectionClassName,
  tone,
}: {
  title: string;
  description: string;
  sectionClassName: string;
  tone: "soft" | "float";
}) {
  return (
    <section className={sectionClassName}>
      <div className="layout-container">
        <div className="mb-7">
          <p className="font-body-04 text-gray-900">{title}</p>
          <p className="mt-2 font-body-01 text-gray-500">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {showcaseItems.map((item) => (
            <ShowcaseCard
              key={`${tone}-${item.id}`}
              tone={tone}
              title={item.title}
              status={item.status}
              location={item.location}
              upperDate={item.upperDate}
              lowerDate={item.lowerDate}
              timerLabel={item.timerLabel}
              timerValue={item.timerValue}
              percent={item.percent}
              returnRate={item.returnRate}
              actionLabel={item.actionLabel}
              image={item.image}
            />
          ))}
        </div>

        <div className="mt-10">
          <p className="mb-4 font-body-03 text-gray-900">Empty State</p>
          <EmptyState
            message="해당 조건에 맞는 프로젝트가 없습니다."
            className={
              tone === "soft"
                ? "mb-0 rounded-[28px] bg-white shadow-weak"
                : "mb-0 rounded-[28px] bg-white shadow-strong"
            }
          />
        </div>
      </div>
    </section>
  );
}

export default function Notice() {
  return (
    <div className="bg-white">
      <section className="layout-container py-15 md:py-20">
        <SectionHeader
          title="Card Surface Study"
          subtitle="프로젝트 목록에서 필요한 정보 구조를 넣은 9개 카드와 empty 상태를 함께 보여주면서, 화이트 계열 화면의 구분감을 비교하는 임시 쇼케이스입니다."
          className="mb-6"
        />
        <p className="font-caption-01 text-gray-400">
          A는 배경 톤 차이 중심, B는 floating shadow 중심 시안입니다.
        </p>
      </section>

      <ShowcaseSection
        title="A. Soft Surface Layer"
        description="섹션 바탕을 아주 옅게 깔고, 카드는 맑은 흰색으로 올리는 방식입니다. 가장 안정적이고 서비스 전반에 확장하기 쉬운 방향입니다."
        sectionClassName="bg-gray-50 py-16 md:py-20"
        tone="soft"
      />

      <ShowcaseSection
        title="B. Floating White Cards"
        description="페이지 전체는 순백에 가깝게 두고, 카드가 떠 있는 듯한 깊이감으로만 구획을 만듭니다. 더 현대적이지만 그림자 튜닝이 중요합니다."
        sectionClassName="bg-white py-16 md:py-20"
        tone="float"
      />
    </div>
  );
}
