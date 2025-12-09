/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Mobile (< 768px) 전용:
 * - 높이: 50px 고정
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 *
 * Desktop/Tablet에서는 숨김
 *
 * @see docs/PRD.md - 레이아웃 구조 정의
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import CreatePostModal from "@/components/post/CreatePostModal";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 프로필 링크 (본인 프로필)
  const profileHref = user ? "/profile" : "/";

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "홈",
    },
    {
      href: "/explore",
      icon: Search,
      label: "검색",
    },
    {
      href: "#",
      icon: PlusSquare,
      label: "만들기",
      onClick: () => {
        setIsCreateModalOpen(true);
      },
    },
    {
      href: "/activity",
      icon: Heart,
      label: "좋아요",
    },
    {
      href: profileHref,
      icon: User,
      label: "프로필",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/profile") {
      return pathname === "/profile" || pathname.startsWith("/profile/");
    }
    return pathname === href;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-card-background border-t border-border z-20">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "flex-1 flex items-center justify-center h-full",
                  "hover:opacity-70 active:scale-95 transition-all"
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    active ? "text-instagram-blue" : "text-text-secondary"
                  )}
                />
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex-1 flex items-center justify-center h-full",
                "hover:opacity-70 active:scale-95 transition-all"
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  active ? "text-instagram-blue" : "text-text-secondary"
                )}
              />
            </Link>
          );
        })}
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // 업로드 성공 시 페이지 새로고침하여 피드 업데이트
          window.location.reload();
        }}
      />
    </nav>
  );
}

