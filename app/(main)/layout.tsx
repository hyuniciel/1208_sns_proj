/**
 * @file layout.tsx
 * @description 메인 애플리케이션 레이아웃 (인증된 사용자 전용)
 *
 * Instagram UI를 재현하는 반응형 레이아웃 구조:
 * - Desktop (1024px+): Sidebar 244px + Main Content 최대 630px
 * - Tablet (768px ~ 1023px): Icon-only Sidebar 72px + Main Content
 * - Mobile (< 768px): Header 60px + Main Content + BottomNav 50px
 *
 * @see docs/PRD.md - 레이아웃 구조 정의
 */

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 인증되지 않은 사용자: 기존 Navbar 표시 */}
      <SignedOut>
        <Navbar />
        {children}
      </SignedOut>

      {/* 인증된 사용자: Instagram 레이아웃 표시 */}
      <SignedIn>
        <div className="min-h-screen bg-background">
          {/* Mobile Header */}
          <Header />

          <div className="flex">
            {/* Desktop/Tablet Sidebar */}
            <Sidebar />

            {/* Main Content */}
            {/* Desktop/Tablet: Sidebar 너비만큼 왼쪽 여백 */}
            {/* Mobile: Header 높이만큼 상단 여백, BottomNav 높이만큼 하단 여백 */}
            <main className="flex-1 min-h-screen lg:ml-[244px] md:ml-[72px] pt-[60px] lg:pt-0 pb-[50px] lg:pb-0">
              <div className="max-w-[630px] mx-auto bg-background">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile BottomNav */}
          <BottomNav />
        </div>
      </SignedIn>
    </>
  );
}

