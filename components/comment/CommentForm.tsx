/**
 * @file CommentForm.tsx
 * @description 댓글 입력 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 폼입니다.
 * - 댓글 입력 필드
 * - Enter 키 또는 "게시" 버튼으로 제출
 * - 로딩 상태 관리
 *
 * @see .cursor/plans/댓글_기능_상세_개발_계획.md
 */

"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommentWithUser } from "@/lib/types";

interface CommentFormProps {
  postId: string;
  onSubmit?: (comment: CommentWithUser) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CommentForm({
  postId,
  onSubmit,
  placeholder = "댓글 달기...",
  disabled = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "댓글 작성에 실패했습니다.");
      }

      const data = await response.json();
      const newComment = data.comment;

      // 입력 필드 초기화
      setContent("");

      // 성공 콜백 호출
      if (onSubmit) {
        onSubmit(newComment);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      console.error("❌ 댓글 작성 에러:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, postId, isSubmitting, disabled, onSubmit]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = content.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <div className="px-4 py-3 border-t border-border">
      {error && (
        <div className="text-sm text-red-500 mb-2 bg-red-50 dark:bg-red-950/20 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting || disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="sm"
          variant="ghost"
          className="px-3"
          aria-label="댓글 게시"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

