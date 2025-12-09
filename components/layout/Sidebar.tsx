/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 동작:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px ~ 1023px): 72px 너비, 아이콘만
 * - Mobile (< 768px): 숨김
 *
 * @see docs/PRD.md - 레이아웃 구조 정의
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Search, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import CreatePostModal from "@/components/post/CreatePostModal";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 프로필 링크 (본인 프로필)
  const profileHref = user ? "/profile" : "/";

  const navItems: NavItem[] = [
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
    <aside className="hidden md:block fixed left-0 top-0 h-screen bg-card-background border-r border-border z-10">
      {/* Desktop: 244px 너비 */}
      <div className="hidden lg:block w-[244px] h-full overflow-y-auto">
        <div className="p-4 pt-8">
          {/* 로고 영역 (선택사항) */}
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-bold text-text-primary">Instagram</h1>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors",
                      "hover:bg-gray-50 active:scale-[0.98]",
                      active && "font-bold text-text-primary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        active ? "text-text-primary" : "text-text-secondary"
                      )}
                    />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-gray-50 active:scale-[0.98]",
                    active && "font-bold text-text-primary"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      active ? "text-text-primary" : "text-text-secondary"
                    )}
                  />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tablet: 72px 너비 (아이콘만) */}
      <div className="lg:hidden w-[72px] h-full overflow-y-auto">
        <div className="p-2 pt-8">
          {/* 로고 영역 (선택사항) */}
          <div className="mb-8 flex justify-center">
            <div className="w-8 h-8 bg-instagram-blue rounded-lg"></div>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={cn(
                      "w-full flex items-center justify-center p-3 rounded-lg transition-colors",
                      "hover:bg-gray-50 active:scale-[0.95]",
                      active && "font-bold"
                    )}
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6",
                        active ? "text-text-primary" : "text-text-secondary"
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
                    "flex items-center justify-center p-3 rounded-lg transition-colors",
                    "hover:bg-gray-50 active:scale-[0.95]",
                    active && "font-bold"
                  )}
                  title={item.label}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      active ? "text-text-primary" : "text-text-secondary"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
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
    </aside>
  );
}

