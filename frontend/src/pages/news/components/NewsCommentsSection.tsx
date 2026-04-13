import Button from "@/components/common/Button";
import type { NewsCommentDTO } from "../mockNews";

type NewsCommentsSectionProps = {
  comments: NewsCommentDTO[];
  isLoggedIn: boolean;
};

export default function NewsCommentsSection({
  comments,
  isLoggedIn,
}: NewsCommentsSectionProps) {
  return (
    <section className="mt-4 rounded-lg bg-white px-6 py-8 shadow-std md:px-8 md:py-10">
      <div className="mb-6">
        <h2 className="font-subtitle-01 text-gray-900">댓글 {comments.length}개</h2>
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
        {comments.map((comment) => (
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
  );
}
