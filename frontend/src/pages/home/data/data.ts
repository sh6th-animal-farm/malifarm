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
  {
    name: 'Shinhan DS',
    src: 'https://www.shinhands.co.kr/assets/images/about/ci_signature1.png',
  },
  {
    name: 'njy',
    src: 'https://njy.mafra.go.kr/images/renewal/i-logo.svg',
  },
  {
    name: 'NH',
    src: 'https://www.nonghyup.com/images/common/logo_nh_main_new.png',
  },
  {
    name: 'NH',
    src: 'https://hrd.rda.go.kr/ehrd_front/assets/images/new/main-page/logo.png',
  },
  {
    name: 'rda',
    src: 'https://www.rda.go.kr/inc/2019_rda/images/main/rda_logo.png',
  },
  {
    name: 'rda',
    src: 'https://smartfarmkorea.net/static/images/common/logo.svg',
  },
  {
    name: 'kcc',
    src: 'https://www.kccworld.co.kr/assets/images/ho/common/img_logo.png',
  },
];

export { stats, partners };
