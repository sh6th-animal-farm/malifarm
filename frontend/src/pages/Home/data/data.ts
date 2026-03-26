import type { Project, Token } from "@/pages/home/types/type";

const stats = [
  { label: "누적 투자금", value: "149.8억" },
  { label: "탄소 저감량", value: "3,420", suffix: "tCO2" },
  { label: "연 평균 수익률", value: "14.2%" },
];

const projects: Project[] = [
  {
    id: 101,
    title: "청양 스마트팜 토마토 3회차",
    status: "SUBSCRIPTION",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?q=80&w=1200&auto=format&fit=crop",
    upperDate: "2026-03-20 ~ 2026-04-02",
    lowerDate: "청약률 82%",
    percent: 82,
    dDay: "D-9",
  },
  {
    id: 102,
    title: "논산 딸기 스마트온실 1회차",
    status: "ANNOUNCEMENT",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1200&auto=format&fit=crop",
    upperDate: "2026-03-25 ~ 2026-04-10",
    lowerDate: "청약 예정 2026-04-12 ~ 2026-04-19",
    percent: 0,
    dDay: "공고중",
  },
  {
    id: 103,
    title: "제주 바질 수직농장 2회차",
    status: "INPROGRESS",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    upperDate: "운영중 프로젝트",
    lowerDate: "2026-01-10 ~ 2026-10-30",
    percent: 64,
    dDay: "운영중",
  },
];

const topTokens: Token[] = [
  { tokenId: 1, tokenName: "청양토마토 STO", marketPrice: 128400, changeRate: 5.21 },
  { tokenId: 2, tokenName: "논산딸기 STO", marketPrice: 97400, changeRate: 3.18 },
  { tokenId: 3, tokenName: "제주바질 STO", marketPrice: 84200, changeRate: -1.14 },
  { tokenId: 4, tokenName: "춘천허브 STO", marketPrice: 76800, changeRate: 2.07 },
  { tokenId: 5, tokenName: "김제파프리카 STO", marketPrice: 71300, changeRate: -0.82 },
  { tokenId: 6, tokenName: "강릉버섯 STO", marketPrice: 68900, changeRate: 1.55 },
  { tokenId: 7, tokenName: "전주로메인 STO", marketPrice: 64100, changeRate: 4.09 },
  { tokenId: 8, tokenName: "제천오이 STO", marketPrice: 60200, changeRate: -2.3 },
  { tokenId: 9, tokenName: "부여멜론 STO", marketPrice: 59100, changeRate: 0.74 },
  { tokenId: 10, tokenName: "울산상추 STO", marketPrice: 55700, changeRate: 1.94 },
];

const kocPoints = [
  { month: "1월", value: 28500 },
  { month: "2월", value: 29200 },
  { month: "3월", value: 27800 },
  { month: "4월", value: 31000 },
  { month: "5월", value: 33500 },
  { month: "6월", value: 35000 },
];

const partners = [
  { name: "Google", src: "https://img.icons8.com/color/96/google-logo.png" },
  { name: "Microsoft", src: "https://img.icons8.com/color/96/microsoft.png" },
  { name: "Amazon", src: "https://img.icons8.com/color/96/amazon.png" },
  { name: "NVIDIA", src: "https://img.icons8.com/color/96/nvidia.png" },
  { name: "Meta", src: "https://img.icons8.com/color/96/meta--v1.png" },
  { name: "Intel", src: "https://img.icons8.com/?size=100&id=TaJZJbJzrhhN&format=png&color=000000"},
];

export { stats, projects, topTokens, kocPoints, partners };