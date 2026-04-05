import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "신입사원 스탯 빌더",
  description: "이 신입의 운명은 당신 손에 — 클릭으로 스탯을 올리고, 최종 성격장애를 완성하세요",
  openGraph: {
    title: "신입사원 스탯 빌더",
    description: "클릭으로 신입사원의 운명을 결정하세요",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
