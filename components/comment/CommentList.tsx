/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일의 댓글 목록을 렌더링합니다.
 * - 댓글 목록 표시
 * - PostCard: 최신 2개만 표시
 * - 삭제 버튼 (본인만)
 * - "모두 보기" 링크
 *
 * @see .cursor/plans/댓글_기능_상세_개발_계획.md
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/time";
import type { CommentWithUser } from "@/lib/types";

interface CommentListProps {
  postId: string;
  comments: CommentWithUser[];
  maxVisible?: number;
  showAllLink?: boolean;
  onCommentDelete?: (commentId: string) => void;
  currentUserId?: string;
  onShowAll?: () => void;
  totalComments?: number;
}

export default function CommentList({
  comments,
  maxVisible,
  showAllLink = true,
  onCommentDelete,
  currentUserId,
  onShowAll,
  totalComments,
}: CommentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleComments = maxVisible
    ? comments.slice(0, maxVisible)
    : comments;

  const hasMore = maxVisible && comments.length > maxVisible;

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;

    try {
      setDeletingId(commentId);

      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "댓글 삭제에 실패했습니다.");
      }

      // 삭제 성공 시 콜백 호출
      if (onCommentDelete) {
        onCommentDelete(commentId);
      }
    } catch (error) {
      console.error("❌ 댓글 삭제 에러:", error);
      alert(
        error instanceof Error
          ? error.message
          : "댓글 삭제에 실패했습니다."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="px-4 space-y-2">
      {hasMore && showAllLink && onShowAll && (
        <button
          onClick={onShowAll}
          className="text-text-secondary text-sm hover:text-text-primary transition-colors"
        >
          댓글 {totalComments !== undefined ? totalComments : comments.length}개 모두 보기
        </button>
      )}

      {visibleComments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2 group">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/profile/${comment.user.id}`}
                className="font-bold text-text-primary text-sm hover:opacity-70 transition-opacity"
              >
                {comment.user.name}
              </Link>
              <span className="text-text-primary text-sm break-words">
                {comment.content}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-text-secondary text-xs">
                {formatRelativeTime(comment.created_at)}
              </span>
              {currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-text-secondary text-xs hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                  {deletingId === comment.id ? "삭제 중..." : "삭제"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

