import { useNavigate, useParams } from "react-router-dom";
import { mockNews, mockNewsComments } from "../mockNews";
import NewsBriefing from "./NewsBriefing";
import NewsArticleBody from "./NewsArticleBody";
import NewsCommentsSection from "./NewsCommentsSection";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const currentIndex = mockNews.findIndex((item) => item.id === Number(id));
  const news = currentIndex >= 0 ? mockNews[currentIndex] : mockNews[0];

  return (
    <main className="min-h-screen">
      <div className="layout-container max-w-840 py-10 md:py-16">
        <button
          type="button"
          onClick={() => navigate("/news")}
          className="mb-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-4 font-button-02 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-[18px] leading-none text-gray-500">‹</span>
          <span>뉴스 목록</span>
        </button>

        <div className="rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
          <section className="pb-8">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-gray-400">
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
            <NewsBriefing briefing={news.briefing} />
          )}

          <NewsArticleBody body={news.body} />
        </div>

        <NewsCommentsSection
          comments={mockNewsComments}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </main>
  );
}
