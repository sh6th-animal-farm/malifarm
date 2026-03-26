import type { Token } from "@/types/projectType";

const stats = [
  { label: "누적 투자금", value: "149.8억" },
  { label: "탄소 저감량", value: "3,420", suffix: "tCO2" },
  { label: "연 평균 수익률", value: "14.2%" },
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

export { stats, topTokens, kocPoints, partners };