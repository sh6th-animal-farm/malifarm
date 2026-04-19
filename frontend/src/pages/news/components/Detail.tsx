import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import { newsApi } from "@/api/newsApi";
import type { MarketNewsDTO } from "@/types/newsType";
import { mockNewsComments } from "@/pages/news/mockNews";
import heroImage from "@/assets/hero.png";

const NEWS_IMAGE_URLS = [
  // STO / 금융 / 거래 화면 계열
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1600&q=80",
];

const formatDate = (value: string): string => {
  const dateOnly = value.includes("T") ? value.split("T")[0] : value;
  return dateOnly.replace(/-/g, ".");
};

const formatHourNews = (value: string): string => {
  const timePart = value.includes("T")
    ? value.split("T")[1]
    : value.split(" ")[1] ?? "";
  const hour = Number.parseInt(timePart.slice(0, 2), 10);

  if (Number.isNaN(hour)) return "";
  return `${hour}시`;
};

const toPercentText = (value: number | null): string => {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
};

const getValueColorClass = (value: number | null): string => {
  if (value == null || Number.isNaN(value) || value === 0) return "text-gray-900";
  return value > 0 ? "text-error" : "text-info";
};

const getValueBorderClass = (value: number | null): string => {
  if (value == null || Number.isNaN(value) || value === 0) return "border-gray-900";
  return value > 0 ? "border-error" : "border-info";
};

const getAdrDisplayText = (text: string | null, value: number | null): string => {
  if (text) return text;
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
};

const getAdrColorClass = (value: number | null): string => {
  if (value == null || Number.isNaN(value)) return "text-gray-500";
  if (value >= 120) return "text-error";
  if (value <= 75) return "text-info";
  return "text-gray-900";
};

const getAdrBorderClass = (value: number | null): string => {
  if (value == null || Number.isNaN(value)) return "border-gray-400";
  if (value >= 120) return "border-error";
  if (value <= 75) return "border-info";
  return "border-gray-900";
};


export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const [news, setNews] = useState<MarketNewsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    const newsId = Number(id);
    if (!newsId) {
      setIsLoading(false);
      setNews(null);
      return;
    }

    let mounted = true;

    const fetchNewsDetail = async () => {
      setIsLoading(true);
      try {
        const response = await newsApi.getGlobalDetail(newsId);
        if (!mounted) return;
        setNews(response ?? null);
      } catch (error) {
        console.error("뉴스 상세 로딩 실패:", error);
        if (!mounted) return;
        setNews(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNewsDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const bodyParagraphs = useMemo(() => {
    if (!news?.summaryText) return [];

    const normalized = news.summaryText.replace(/\s+/g, " ").trim();
    const sentences = normalized
      // 소수점 숫자(예: 2634.4)는 문장 경계로 보지 않음
      .replace(/([.!?。！？])(?!\d)\s+/g, "$1\n")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) return [];

    const chunks: string[] = [];
    let index = 0;
    let useThree = true;

    while (index < sentences.length) {
      const size = useThree ? 3 : 2;
      chunks.push(sentences.slice(index, index + size).join(" "));
      index += size;
      useThree = !useThree;
    }

    return chunks;
  }, [news?.summaryText]);

  const hotTokens = useMemo(() => {
    if (!news?.highlightTokens) return [];
    return news.highlightTokens
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 5);
  }, [news?.highlightTokens]);

  const newsImageUrl = useMemo(() => {
    if (useFallbackImage) return heroImage;
    if (NEWS_IMAGE_URLS.length === 0) return heroImage;
    return NEWS_IMAGE_URLS[imageIndex] ?? heroImage;
  }, [imageIndex, useFallbackImage]);

  useEffect(() => {
    if (!news || NEWS_IMAGE_URLS.length === 0) return;
    const safeIndex = Math.abs(news.newsId) % NEWS_IMAGE_URLS.length;
    setImageIndex(safeIndex);
    setUseFallbackImage(false);
  }, [news]);

  const handleImageError = () => {
    if (useFallbackImage) return;
    if (NEWS_IMAGE_URLS.length === 0) {
      setUseFallbackImage(true);
      return;
    }

    if (imageIndex < NEWS_IMAGE_URLS.length - 1) {
      setImageIndex((prev) => prev + 1);
      return;
    }

    setUseFallbackImage(true);
  };

  return (
    <main className="min-h-screen md:bg-white">
      <div className="layout-container max-w-840 py-10 md:py-16">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="mb-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-4 font-button-02 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-[18px] leading-none text-gray-500">‹</span>
          <span>뉴스 목록</span>
        </button>

        {isLoading ? (
          <div className="rounded-lg bg-white px-6 py-24 text-center text-gray-400 shadow-std md:px-8">
            뉴스를 불러오는 중입니다...
          </div>
        ) : !news ? (
          <EmptyState message="뉴스를 찾을 수 없습니다." />
        ) : (
          <div className="rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
            <section className="pb-8">
              <div className="mb-5 flex flex-wrap items-center gap-3 text-gray-400">
                <span className="font-caption-03 text-green-600">{formatHourNews(news.createdAt)}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-caption-01">마리팜 뉴스</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-caption-01">{formatDate(news.createdAt)}</span>
              </div>

              <h1 className="font-header-02 text-gray-900">
                {news.title ?? news.summaryShort}
              </h1>

              <div className="mt-6 border-l-2 border-green-600/20 pl-4 md:pl-5">
                <p className="font-subtitle-03 text-gray-600">
                  {news.summaryShort}
                </p>
              </div>
            </section>

            <section className="pb-8">
              <div className="h-[320px] w-full overflow-hidden rounded-lg md:h-[380px]">
                <img
                  src={newsImageUrl}
                  alt="STO 및 디지털 자산 시장을 상징하는 더미 이미지"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
            </section>

            <section>
              <div className="grid gap-3 md:grid-cols-3">
                <div className={`border-l-4 ${getValueBorderClass(news.avgChangeRate)} pl-4 py-1`}>
                  <p className="font-caption-02 text-gray-500">평균 등락률</p>
                  <p className={`mt-1 font-header-02 ${getValueColorClass(news.avgChangeRate)}`}>{toPercentText(news.avgChangeRate)}</p>
                </div>

                {/* <div className={`border-l-4 ${getValueBorderClass(news.adrValue)} pl-4 py-1`}>
                  <p className="font-caption-02 text-gray-500">시장 투심 (ADR)</p>
                  <p className={`mt-1 font-header-02 ${getValueColorClass(news.adrValue)}`}>{toPercentText(news.adrValue)}</p>
                </div> */}

                <div className={`border-l-4 ${getAdrBorderClass(news.adrValue)} pl-4 py-1`}>
                  <p className="font-caption-02 text-gray-500">시장 투심 (ADR)</p>
                  <p className={`mt-1 font-header-02 ${getAdrColorClass(news.adrValue)}`}>
                    {getAdrDisplayText(news.adrText, news.adrValue)}
                  </p>
                </div>   


                <div className={`border-l-4 ${getValueBorderClass(news.volGrowthRate)} pl-4 py-1`}>
                  <p className="font-caption-02 text-gray-500">유동성 흐름</p>
                  <p className={`mt-1 font-header-02 ${getValueColorClass(news.volGrowthRate)}`}>{toPercentText(news.volGrowthRate)}</p>
                </div>
              </div>
            </section>

            <section className="pt-8 pb-12">
              <div className="flex flex-col gap-10">
                {bodyParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="whitespace-pre-line font-body-01 leading-[1.6] tracking-[0.01em] text-gray-700"
                  >
                    {paragraph}
                  </p>
                ))}

                {hotTokens.length > 0 && (
                  <div className="pt-4">
                    <p className="font-caption-02 text-gray-500">오늘의 핫 토큰</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {hotTokens.map((token) => (
                        <li key={token} className="font-body-02 text-gray-700">
                          • {token}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
        <section className="mt-4 rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
          <div className="mb-6">
            <h2 className="font-subtitle-01 text-gray-900">댓글 {mockNewsComments.length}개</h2>
          </div>

          <div className="border-b border-gray-100 pb-6">
            <textarea
              rows={4}
              disabled={!isLoggedIn}
              placeholder={
                isLoggedIn
                  ? "의견을 남겨보세요."
                  : "로그인 후 댓글을 작성할 수 있습니다."
              }
              className={`min-h-120 resize-none placeholder:text-gray-400 ${
                isLoggedIn
                  ? "border-gray-200 bg-white text-gray-700 focus:border-green-500"
                  : "border-gray-100 bg-gray-50 text-gray-400"
              }`}
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="font-caption-01 text-gray-400" />
              <Button
                variant={isLoggedIn ? "default" : "outline-disabled"}
                width={84}
                height={36}
                className="rounded-full font-button-02"
                disabled={!isLoggedIn}
              >
                등록
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            {mockNewsComments.map((comment) => (
              <article
                key={comment.id}
                className="border-b border-gray-50 py-6 last:border-b-0"
              >
                <div className="mb-2 flex items-center gap-3 text-gray-400">
                  <span className="font-caption-03 text-gray-700">
                    {comment.author}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="font-caption-01">{comment.date}</span>
                </div>
                <p className="font-body-01 leading-loose text-gray-700">
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
