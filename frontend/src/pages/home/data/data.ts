export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

const stats: StatItem[] = [
  { label: '누적 투자금', value: '149.8억' },
  { label: '탄소 저감량', value: '3,420', suffix: 'tCO2' },
  { label: '연 평균 수익률', value: '14.2%' },
];

const partners = [
  { name: 'Google', src: 'https://img.icons8.com/color/96/google-logo.png' },
  { name: 'Microsoft', src: 'https://img.icons8.com/color/96/microsoft.png' },
  { name: 'Amazon', src: 'https://img.icons8.com/color/96/amazon.png' },
  { name: 'NVIDIA', src: 'https://img.icons8.com/color/96/nvidia.png' },
  { name: 'Meta', src: 'https://img.icons8.com/color/96/meta--v1.png' },
  {
    name: 'Intel',
    src: 'https://img.icons8.com/?size=100&id=TaJZJbJzrhhN&format=png&color=000000',
  },
];

export { stats, partners };
