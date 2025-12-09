/**
 * @file LikeButton.tsx
 * @description 좋아요 버튼 컴포넌트
 *
 * Instagram 스타일의 좋아요 버튼입니다.
 * - 빈 하트 ↔ 빨간 하트 상태 관리
 * - 클릭 애니메이션 (scale 1.3 → 1)
 * - 더블탭 좋아요 지원 (외부에서 트리거)
 * - Optimistic Update 패턴 사용
 *
 * @see .cursor/plans/좋아요_기능_상세_개발_계획.md
 */

"use client";

import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: "sm" | "md" | "lg";
  enableDoubleTap?: boolean;
  className?: string;
}

export interface LikeButtonRef {
  handleDoubleTap: () => void;
}

const LikeButton = forwardRef<LikeButtonRef, LikeButtonProps>(
  (
    {
      postId,
      initialLiked,
      initialLikesCount,
      onLikeChange,
      size = "md",
      enableDoubleTap = false,
      className,
    },
    ref
  ) => {
    const [liked, setLiked] = useState(initialLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
      if (isLoading || isAnimating) return;

      // Optimistic Update
      const previousLiked = liked;
      const previousCount = likesCount;
      const newLiked = !liked;
      const newCount = newLiked ? likesCount + 1 : likesCount - 1;

      setLiked(newLiked);
      setLikesCount(newCount);
      setIsAnimating(true);
      setIsLoading(true);

      // 클릭 애니메이션 (0.15초)
      setTimeout(() => setIsAnimating(false), 150);

      try {
        const response = await fetch("/api/likes", {
          method: newLiked ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
          // 롤백
          setLiked(previousLiked);
          setLikesCount(previousCount);
          const error = await response.json().catch(() => ({}));
          console.error("좋아요 실패:", error);
          return;
        }

        // 성공 시 콜백 호출
        if (onLikeChange) {
          onLikeChange(newLiked, newCount);
        }
      } catch (error) {
        // 롤백
        setLiked(previousLiked);
        setLikesCount(previousCount);
        console.error("좋아요 에러:", error);
      } finally {
        setIsLoading(false);
      }
    }, [postId, liked, likesCount, isLoading, isAnimating, onLikeChange]);

    // 더블탭 핸들러 (외부에서 호출 가능)
    const handleDoubleTap = useCallback(async () => {
      if (isLoading || liked) return;

      // 더블탭으로 좋아요 추가
      await handleClick();
    }, [liked, isLoading, handleClick]);

    // ref를 통해 외부에서 더블탭 트리거 가능하도록
    useImperativeHandle(ref, () => ({
      handleDoubleTap,
    }));

    const sizeClasses = {
      sm: "w-5 h-5",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "transition-transform duration-150",
          "hover:opacity-80",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isAnimating && "scale-[1.3]",
          className
        )}
        aria-label={liked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            "transition-colors",
            liked ? "fill-like text-like" : "text-text-primary"
          )}
        />
      </button>
    );
  }
);

LikeButton.displayName = "LikeButton";

export default LikeButton;

/**
 * 더블탭 애니메이션 컴포넌트
 * PostCard의 이미지 영역 위에 표시되는 큰 하트
 * 
 * 애니메이션:
 * - fade in: 0.2초
 * - 유지: 0.6초
 * - fade out: 0.2초
 * 총 1초
 */
export function DoubleTapHeart({ isAnimating }: { isAnimating: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-10",
        "transition-opacity duration-200 ease-in-out",
        isAnimating ? "opacity-100" : "opacity-0"
      )}
    >
      <Heart 
        className={cn(
          "w-20 h-20 fill-like text-like",
          "transition-all duration-200 ease-in-out",
          isAnimating ? "scale-100" : "scale-75"
        )} 
      />
    </div>
  );
}

