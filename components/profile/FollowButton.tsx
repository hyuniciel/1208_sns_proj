/**
 * @file FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * Instagram 스타일의 팔로우/언팔로우 버튼입니다.
 * - 미팔로우: "팔로우" 버튼 (파란색)
 * - 팔로우 중: "팔로잉" 버튼 (회색)
 * - Hover 시: "언팔로우" (빨간 테두리)
 * - Optimistic UI 업데이트
 *
 * @see .cursor/plans/팔로우_기능_상세_개발_계획.md
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string; // 팔로우할 대상 사용자 ID
  initialIsFollowing: boolean; // 초기 팔로우 상태
  initialFollowersCount: number; // 초기 팔로워 수
  onFollowChange?: (
    isFollowing: boolean,
    newFollowersCount: number
  ) => void;
  disabled?: boolean; // 버튼 비활성화 (본인 프로필 등)
  size?: "sm" | "default" | "lg"; // 버튼 크기
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
  onFollowChange,
  disabled = false,
  size = "sm",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Props 변경 시 상태 동기화
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setFollowersCount(initialFollowersCount);
  }, [initialIsFollowing, initialFollowersCount]);

  const handleToggleFollow = useCallback(async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    const previousState = isFollowing;
    const previousCount = followersCount;

    try {
      if (isFollowing) {
        // 언팔로우
        const response = await fetch("/api/follows", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            following_id: targetUserId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "언팔로우에 실패했습니다."
          );
        }

        setIsFollowing(false);
        const newCount = Math.max(0, followersCount - 1);
        setFollowersCount(newCount);

        // 성공 콜백 호출
        if (onFollowChange) {
          onFollowChange(false, newCount);
        }
      } else {
        // 팔로우
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            following_id: targetUserId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "팔로우에 실패했습니다.");
        }

        setIsFollowing(true);
        const newCount = followersCount + 1;
        setFollowersCount(newCount);

        // 성공 콜백 호출
        if (onFollowChange) {
          onFollowChange(true, newCount);
        }
      }
    } catch (error) {
      // 상태 롤백
      setIsFollowing(previousState);
      setFollowersCount(previousCount);

      console.error("❌ 팔로우 에러:", error);
      alert(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    disabled,
    isFollowing,
    followersCount,
    targetUserId,
    onFollowChange,
  ]);

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (isLoading) {
      return "처리 중...";
    }
    if (isFollowing) {
      return isHovering ? "언팔로우" : "팔로잉";
    }
    return "팔로우";
  };

  // 버튼 스타일 결정
  const getButtonVariant = () => {
    if (isFollowing && isHovering) {
      return "outline";
    }
    return isFollowing ? "outline" : "default";
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleToggleFollow}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "text-sm",
        isFollowing &&
          isHovering &&
          "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
      )}
    >
      {getButtonText()}
    </Button>
  );
}

