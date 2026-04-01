type CarbonTagVariant = "info" | "warning" | "success" | "default";

const numberFormatter = new Intl.NumberFormat("ko-KR");

export const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const normalizeDate = (value: string): string => {
  if (!value) return "-";
  if (value.includes(".")) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}. ${mm}. ${dd}`;
};

export const isExpired = (endDate: string): boolean => {
  if (!endDate) return false;
  const normalized = endDate.includes(".")
    ? endDate.replace(/\./g, "-").replace(/\s+/g, "")
    : endDate;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const typeBadge = (
  cpType: string,
  endDate: string,
): { label: string; variant: CarbonTagVariant } => {
  if (isExpired(endDate)) {
    return {
      label: "기간 만료",
      variant: "default",
    };
  }

  if (cpType === "REDUCTION" || cpType === "감축형") {
    return {
      label: "감축형",
      variant: "info",
    };
  }

  if (cpType === "REMOVAL" || cpType === "제거형") {
    return {
      label: "제거형",
      variant: "warning",
    };
  }

  return {
    label: cpType || "-",
    variant: "default",
  };
};

export const formatTco2e = (value: number | string | null | undefined): string => {
  return `${numberFormatter.format(toNumber(value))} tCO2e`;
};

export const formatWon = (value: number | string | null | undefined): string => {
  return `${numberFormatter.format(toNumber(value))}원`;
};
