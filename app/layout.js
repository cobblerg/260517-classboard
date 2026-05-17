import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 한글 폰트 설정
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "ClassBoard — 학생 Q&A",
  description: "수업 시간에 학생들이 서로 질문하고 답변하는 Q&A 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body>{children}</body>
    </html>
  );
}
