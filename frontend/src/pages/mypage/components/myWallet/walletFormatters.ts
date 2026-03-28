export const numberFormatter = new Intl.NumberFormat("ko-KR");

export const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const formatAmount = (value: number | string | null | undefined): string => {
  return numberFormatter.format(toNumber(value));
};

export const formatSignedAmount = (value: number | string | null | undefined): string => {
  const num = toNumber(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${numberFormatter.format(num)}`;
};

export const formatSignedRate = (value: number | string | null | undefined): string => {
  const num = toNumber(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

export const rateColorClass = (value: number | string | null | undefined): string => {
  const num = toNumber(value);
  if (num > 0) return "text-error";
  if (num < 0) return "text-info";
  return "text-gray-900";
};

export const compareAmountColorClass = (
  marketValue: number | string | null | undefined,
  purchasedValue: number | string | null | undefined,
): string => {
  const market = toNumber(marketValue);
  const purchased = toNumber(purchasedValue);
  if (market > purchased) return "text-error";
  if (market < purchased) return "text-info";
  return "text-gray-900";
};
