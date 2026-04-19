const numberFormatter = new Intl.NumberFormat('ko-KR');

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const formatDateTime = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

const formatWon = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  return `${numberFormatter.format(toNumber(value))} 원`;
};

const formatSt = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = toNumber(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${numberFormatter.format(num)} st`;
};

const typeLabelMap: Record<string, string> = {
  BUY: '매수',
  SELL: '매도',
  PASS: '당첨',
  FAIL: '낙첨',
  CANCELLED: '취소',
  DIVIDEND: '배당',
  BURN: '소각',
};

const typeColorClass = (type: string) => {
  if (type === 'BUY') return 'text-error';
  if (type === 'SELL') return 'text-info';
  if (type === 'PASS') return 'text-info';
  if (type === 'FAIL') return 'text-error';
  if (type === 'DIVIDEND') return 'text-warning';
  return 'text-gray-700';
};

const toCategory = (tab: string, filter: string) => {
  if (filter !== 'ALL') return filter;
  return tab;
};

export {
  formatDateTime,
  formatSt,
  formatWon,
  numberFormatter,
  toCategory,
  toNumber,
  typeColorClass,
  typeLabelMap,
};
