import Icon from "@/components/icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

type PaginationItem = number | "ellipsis";

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages < 1) {
    return null;
  }

  const paginationItems = buildPaginationItems(currentPage, totalPages);
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return (
    <nav
      className={`flex justify-center ${className}`}
      aria-label="페이지네이션"
    >
      <div className="inline-flex items-center gap-2 rounded-full px-1 py-1">
        <button
          type="button"
          aria-label="이전 페이지"
          disabled={isPrevDisabled}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="pagination-nav-button"
        >
          <Icon
            name="chevron_right"
            size={16}
            className="rotate-180 text-current"
          />
          {/* <span>Prev</span> */}
        </button>

        <div className="flex items-center gap-0.5">
          {paginationItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-10 min-w-8 items-center justify-center font-body-02 text-gray-300"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = currentPage === item;

            return (
              <button
                key={item}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onPageChange?.(item)}
                className={`pagination-page ${isActive ? "bg-gray-100 text-gray-900 hover:bg-gray-100/80 hover:text-gray-900" : ""}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="다음 페이지"
          disabled={isNextDisabled}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="pagination-nav-button"
        >
          {/* <span>Next</span> */}
          <Icon name="chevron_right" size={16} className="text-current" />
        </button>
      </div>
    </nav>
  );
}
