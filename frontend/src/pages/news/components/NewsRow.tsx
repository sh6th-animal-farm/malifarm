import { useNavigate } from "react-router-dom";
import Icon from "@/components/icon";

type NewsRowProps = {
  id: number;
  hourLabel: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
};

export default function NewsRow({
  id,
  hourLabel,
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
      className="group grid w-full grid-cols-[minmax(0,1fr)_28px] cursor-pointer gap-x-2 gap-y-2 border-b border-gray-100 px-2 py-5 text-left outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:bg-gray-50 active:bg-gray-100 last:border-b-0 sm:px-3 md:grid-cols-[minmax(0,1fr)_40px] md:gap-x-3 md:px-4 md:py-6 lg:px-6"
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400">
          {hourLabel && <span className="font-caption-03 text-green-600">{hourLabel}</span>}
          {hourLabel && <span className="h-1 w-1 rounded-full bg-gray-300" />}
          <span className="font-caption-01">{source}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <time className="font-caption-01">{publishedAt}</time>
        </div>
        <h3 className="mb-2 line-clamp-2 font-body-02 text-gray-900 transition-colors group-hover:text-green-700 md:font-body-03">
          {title}
        </h3>
        <p className="line-clamp-2 text-[14px] leading-[1.6] text-gray-500 md:font-body-01">{summary}</p>
      </div>

      <div className="flex items-center justify-end self-center">
        <Icon
          name="chevron_right"
          size={18}
          className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500"
        />
      </div>
    </button>
  );
}
