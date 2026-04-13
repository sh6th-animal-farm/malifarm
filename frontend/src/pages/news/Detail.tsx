import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/common/Button";
import Icon from "@/components/icon";
import type { IconName } from "@/components/icon/iconTypes";
import { mockNews, mockNewsComments } from "./mockNews";

function getValueColorClass(value: string) {
  const numericValue = Number(value.replace("%", ""));

  if (Number.isNaN(numericValue)) return "text-gray-900";
  if (numericValue > 0) return "text-error";
  if (numericValue < 0) return "text-info";
  return "text-gray-900";
}

function getValueIconName(value: string): IconName | null {
  const numericValue = Number(value.replace("%", ""));

  if (Number.isNaN(numericValue) || numericValue === 0) return null;
  return numericValue > 0 ? "price_up" : "price_down";
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const currentIndex = mockNews.findIndex((item) => item.id === Number(id));
  const news = currentIndex >= 0 ? mockNews[currentIndex] : mockNews[0];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="layout-container max-w-840 py-14 md:py-16">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 font-body-02 text-gray-500 transition-colors hover:text-gray-700"
        >
          <span className="font-header-03 font-bold leading-none text-gray-700">‹</span>
          뉴스 목록
        </button>

        <div className="rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
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
                <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
                  <p className="font-caption-02 text-gray-500">시장 투심 (ADR)</p>
                  <div className={`mt-3 flex items-center justify-center gap-2 font-header-02 ${getValueColorClass(news.briefing.marketSentiment.value)}`}>
                    {getValueIconName(news.briefing.marketSentiment.value) && (
                      <Icon
                        name={getValueIconName(news.briefing.marketSentiment.value)!}
                        size={18}
                      />
                    )}
                    <p>
                      {news.briefing.marketSentiment.value}
                    </p>
                  </div>
                </div>

                <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
                  <p className="font-caption-02 text-gray-500">유동성 흐름</p>
                  <div className={`mt-3 flex items-center justify-center gap-2 font-header-02 ${getValueColorClass(news.briefing.liquidityFlow.value)}`}>
                    {getValueIconName(news.briefing.liquidityFlow.value) && (
                      <Icon
                        name={getValueIconName(news.briefing.liquidityFlow.value)!}
                        size={18}
                      />
                    )}
                    <p>
                      {news.briefing.liquidityFlow.value}
                    </p>
                  </div>
                </div>

                <div className="flex h-full flex-col justify-center rounded-lg bg-gray-50 px-5 py-4 text-center">
                  <p className="font-caption-02 text-gray-500">오늘의 핫 토큰</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {news.briefing.hotTokens.map((token) => (
                      <button
                        key={token}
                        type="button"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1 font-caption-02 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        {token}
                      </button>
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
                  className="whitespace-pre-line font-body-01 leading-loose text-gray-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
          <div className="mb-6">
              <h2 className="font-subtitle-01 text-gray-900">
              댓글 {mockNewsComments.length}개
            </h2>
          </div>

          <div className="border-b border-gray-100 pb-6">
            <textarea
              rows={4}
              disabled={!isLoggedIn}
              placeholder={
                isLoggedIn ? "의견을 남겨보세요." : "로그인 후 댓글을 작성할 수 있습니다."
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
