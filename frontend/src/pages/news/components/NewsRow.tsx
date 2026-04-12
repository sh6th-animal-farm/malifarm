import { useNavigate } from "react-router-dom";
import Icon from "@/components/icon";

type NewsRowProps = {
  id: number;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export default function NewsRow({
  id,
  source,
  title,
  summary,
  publishedAt,
}: NewsRowProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/news/${id}`)}
      className="group grid w-full cursor-pointer gap-3 border-b border-gray-100 px-3 py-6 text-left outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:bg-gray-50 active:bg-gray-100 last:border-b-0 md:grid-cols-[minmax(0,1fr)_40px]"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-gray-400">
          <span className="font-caption-01">{source}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <time className="font-caption-01">{publishedAt}</time>
        </div>
        <h3 className="mb-2 font-body-03 text-gray-900 transition-colors group-hover:text-green-700">
          {title}
        </h3>
        <p className="line-clamp-2 font-body-01 text-gray-500">{summary}</p>
      </div>

      <div className="flex items-center justify-end">
        <Icon
          name="chevron_right"
          size={20}
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </button>
  );
}
