/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * Mobile (< 768px) 전용:
 * - 높이: 60px 고정
 * - 로고 + 알림/DM/프로필 아이콘
 *
 * Desktop/Tablet에서는 숨김
 *
 * @see docs/PRD.md - 레이아웃 구조 정의
 */

"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Heart, Send } from "lucide-react";

export default function Header() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-card-background border-b border-border z-20">
      <div className="flex items-center justify-between h-full px-4">
        {/* 왼쪽: 로고 */}
        <Link href="/" className="text-xl font-bold text-text-primary">
          Instagram
        </Link>

        {/* 오른쪽: 아이콘 버튼들 */}
        <div className="flex items-center gap-4">
          {/* 알림 (1차 제외, UI만) */}
          <Link
            href="/activity"
            className="text-text-primary hover:opacity-70 active:scale-95 transition-all"
            aria-label="알림"
          >
            <Heart className="w-6 h-6" />
          </Link>

          {/* DM (1차 제외, UI만) */}
          <Link
            href="/direct"
            className="text-text-primary hover:opacity-70 active:scale-95 transition-all"
            aria-label="메시지"
          >
            <Send className="w-6 h-6" />
          </Link>

          {/* 프로필 */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-6 h-6",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

