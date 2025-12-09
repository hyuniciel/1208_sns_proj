/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일의 프로필 헤더입니다.
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명 및 통계
 * - 팔로우 버튼 (다른 사람 프로필)
 *
 * @see .cursor/plans/프로필_페이지_상세_개발_계획.md
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";

interface ProfileHeaderProps {
  user: {
    id: string;
    clerk_id: string;
    name: string;
    created_at: string;
    posts_count: number;
    followers_count: number;
    following_count: number;
    is_following?: boolean;
    is_own_profile?: boolean;
  };
  currentUserId?: string;
  onFollowChange?: (isFollowing: boolean, newFollowersCount: number) => void;
}

export default function ProfileHeader({
  user,
  currentUserId,
  onFollowChange,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(user.is_following || false);
  const [followersCount, setFollowersCount] = useState(user.followers_count);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (isLoading || user.is_own_profile) return;

    setIsLoading(true);
    try {
      // 팔로우 기능은 9번에서 구현 예정
      // 일단 기본 구조만 구현
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      
      const newCount = newIsFollowing
        ? followersCount + 1
        : Math.max(0, followersCount - 1);
      setFollowersCount(newCount);

      if (onFollowChange) {
        onFollowChange(newIsFollowing, newCount);
      }
    } catch (error) {
      console.error("❌ 팔로우 에러:", error);
      // 상태 롤백
      setIsFollowing(!isFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-4 py-6">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0">
        <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {/* 기본 아바타 (이름 첫 글자) */}
          <span className="text-2xl md:text-4xl font-bold text-text-secondary">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex-1 min-w-0">
        {/* 사용자명 및 버튼 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-light text-text-primary">
            {user.name}
          </h1>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            {user.is_own_profile ? (
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                disabled
              >
                프로필 편집
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={isLoading}
                className="text-sm"
              >
                {isLoading
                  ? "처리 중..."
                  : isFollowing
                  ? "팔로잉"
                  : "팔로우"}
              </Button>
            )}
            {/* 메시지 버튼 (1차 제외) */}
          </div>
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-4 md:gap-8 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-text-primary">
              {user.posts_count.toLocaleString()}
            </span>
            <span className="text-text-secondary">게시물</span>
          </div>
          <button
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            disabled={user.is_own_profile}
          >
            <span className="font-semibold text-text-primary">
              {followersCount.toLocaleString()}
            </span>
            <span className="text-text-secondary">팔로워</span>
          </button>
          <button
            className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            disabled={user.is_own_profile}
          >
            <span className="font-semibold text-text-primary">
              {user.following_count.toLocaleString()}
            </span>
            <span className="text-text-secondary">팔로잉</span>
          </button>
        </div>

        {/* 사용자명 (선택적, bio는 1차 제외) */}
        <div className="hidden md:block">
          <p className="font-semibold text-text-primary">{user.name}</p>
        </div>
      </div>
    </div>
  );
}

