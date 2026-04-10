import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/common/Button";
import { mockNews } from "./mockNews";

const sampleComments = [
  {
    id: 1,
    author: "greenfield",
    date: "2026.04.10 09:24",
    content:
      "공지랑 분리되니까 읽기가 훨씬 편하네요. 이런 식으로 배경 설명이 같이 있는 콘텐츠가 더 자주 올라오면 좋겠습니다.",
  },
  {
    id: 2,
    author: "farmnote",
    date: "2026.04.10 11:08",
    content:
      "뉴스 형식으로 보니까 서비스 방향성이 더 잘 이해돼요. 프로젝트 관련 기사도 이런 톤으로 계속 이어졌으면 합니다.",
  },
];

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const currentIndex = mockNews.findIndex((item) => item.id === Number(id));
  const news = currentIndex >= 0 ? mockNews[currentIndex] : mockNews[0];

  return (
    <main className="min-h-screen bg-white">
      <div className="layout-container max-w-[840px] py-14 md:py-16">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="mb-8 inline-flex cursor-pointer items-center gap-2 font-caption-02 text-gray-400 transition-colors hover:text-gray-700"
        >
          <span className="font-subtitle-01 leading-none">‹</span>
          뉴스 목록
        </button>

        <section className="pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-gray-400">
            <span className="font-caption-03 text-green-700">{news.section}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="font-caption-01">{news.source}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="font-caption-01">{news.publishedAt}</span>
          </div>

          <h1 className="font-header-02 text-gray-900">
            {news.title}
          </h1>

          <div className="mt-6 border-l-2 border-green-600/20 pl-4 md:pl-5">
            <p className="font-subtitle-03 text-gray-600">
              {news.summary}
            </p>
          </div>
        </section>

        {news.briefing && (
          <section>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[16px] bg-gray-50 px-5 py-4">
                <p className="font-caption-02 text-gray-500">시장 투심 (ADR)</p>
                <p className="mt-2 font-header-04 text-gray-900">
                  {news.briefing.marketSentiment.value}
                </p>
                <p className="mt-1 font-caption-01 text-gray-600">
                  {news.briefing.marketSentiment.label}
                </p>
              </div>

              <div className="rounded-[16px] bg-gray-50 px-5 py-4">
                <p className="font-caption-02 text-gray-500">유동성 흐름</p>
                <p className="mt-2 font-header-04 text-gray-900">
                  {news.briefing.liquidityFlow.value}
                </p>
                <p className="mt-1 font-caption-01 text-gray-600">
                  {news.briefing.liquidityFlow.label}
                </p>
              </div>

              <div className="rounded-[16px] bg-gray-50 px-5 py-4">
                <p className="font-caption-02 text-gray-500">오늘의 핫 토큰</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {news.briefing.hotTokens.map((token) => (
                    <span key={token} className="font-body-01 text-gray-700">
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="flex flex-col gap-7">
            {news.body.map((paragraph, index) => (
              <p
                key={index}
                className="whitespace-pre-line font-body-01 text-gray-700 [line-height:1.9]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-4 border-t border-gray-100 pt-8">
          <div className="mb-6">
            <h2 className="font-subtitle-01 text-gray-900">
              댓글 {sampleComments.length}개
            </h2>
          </div>

          <div className="border-b border-gray-100 pb-6">
            <textarea
              rows={4}
              disabled={!isLoggedIn}
              placeholder={
                isLoggedIn ? "의견을 남겨보세요." : "로그인 후 댓글을 작성할 수 있습니다."
              }
              className={`min-h-[120px] resize-none placeholder:!text-gray-400 ${
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
                className="!rounded-full !font-button-02"
                disabled={!isLoggedIn}
              >
                등록
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col">
            {sampleComments.map((comment) => (
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
                <p className="font-body-01 leading-[1.8] text-gray-700">
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
