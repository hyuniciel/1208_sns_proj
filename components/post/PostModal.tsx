/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 상세 모달입니다.
 * - Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * - Mobile: 전체 페이지로 전환
 * - 이전/다음 게시물 네비게이션 (Desktop)
 * - 키보드 이벤트 지원 (ESC, ← →)
 *
 * @see .cursor/plans/게시물_상세_모달_상세_개발_계획.md
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils/time";
import LikeButton, { DoubleTapHeart, type LikeButtonRef } from "./LikeButton";
import CommentList from "@/components/comment/CommentList";
import CommentForm from "@/components/comment/CommentForm";
import PostCardSkeleton from "./PostCardSkeleton";
import type { PostWithUser, CommentWithUser } from "@/lib/types";

interface PostModalProps {
  postId: string | null; // null이면 모달 닫힘
  isOpen: boolean;
  onClose: () => void;
  onPostChange?: (
    postId: string,
    changes: { likes?: number; comments?: number }
  ) => void;
  currentUserId?: string;
  // 이전/다음 네비게이션용 (선택적)
  allPostIds?: string[]; // 현재 피드의 모든 게시물 ID 배열
  onNavigate?: (postId: string) => void; // 다른 게시물로 이동 시 호출
}

export default function PostModal({
  postId,
  isOpen,
  onClose,
  onPostChange,
  currentUserId,
  allPostIds,
  onNavigate,
}: PostModalProps) {
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDoubleTapAnimating, setIsDoubleTapAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const likeButtonRef = useRef<LikeButtonRef>(null);
  const lastTapRef = useRef(0);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 게시물 데이터 로딩
  useEffect(() => {
    if (!postId || !isOpen) {
      setPost(null);
      setComments([]);
      setError(null);
      return;
    }

    async function loadPost() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("게시물을 불러올 수 없습니다.");
        }
        const data = await response.json();
        if (data.error || !data.data) {
          throw new Error(data.error || "게시물을 찾을 수 없습니다.");
        }
        setPost(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [postId, isOpen]);

  // 댓글 목록 로드
  useEffect(() => {
    if (!postId || !isOpen) return;

    async function loadComments() {
      setIsLoadingComments(true);
      try {
        const response = await fetch(
          `/api/comments?post_id=${postId}&limit=50&offset=0`
        );
        if (!response.ok) {
          throw new Error("댓글을 불러올 수 없습니다.");
        }
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error("❌ 댓글 로드 에러:", err);
      } finally {
        setIsLoadingComments(false);
      }
    }

    loadComments();
  }, [postId, isOpen]);

  // 이전/다음 네비게이션
  const currentIndex =
    allPostIds && postId ? allPostIds.findIndex((id) => id === postId) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext =
    currentIndex >= 0 &&
    currentIndex < (allPostIds?.length ?? 0) - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious && allPostIds && currentIndex > 0) {
      onNavigate?.(allPostIds[currentIndex - 1]);
    }
  }, [hasPrevious, allPostIds, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext && allPostIds && currentIndex >= 0) {
      onNavigate?.(allPostIds[currentIndex + 1]);
    }
  }, [hasNext, allPostIds, currentIndex, onNavigate]);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && !isMobile) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && !isMobile) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile, onClose, handlePrevious, handleNext]);

  // 더블탭 핸들러
  const handleDoubleTap = useCallback(() => {
    if (!post || post.is_liked) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setIsDoubleTapAnimating(true);
      likeButtonRef.current?.handleDoubleTap();

      setTimeout(() => setIsDoubleTapAnimating(false), 1000);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [post]);

  // 좋아요 변경 핸들러
  const handleLikeChange = useCallback(
    (liked: boolean, newCount: number) => {
      if (!post) return;

      setPost((prev) =>
        prev ? { ...prev, is_liked: liked, likes_count: newCount } : null
      );

      if (onPostChange) {
        onPostChange(post.id, { likes: newCount });
      }
    },
    [post, onPostChange]
  );

  // 댓글 작성 핸들러
  const handleCommentSubmit = useCallback(
    (newComment: CommentWithUser) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) {
          return prev;
        }
        return [...prev, newComment];
      });

      if (post) {
        const newCount = (post.comments_count || 0) + 1;
        setPost((prev) =>
          prev ? { ...prev, comments_count: newCount } : null
        );

        if (onPostChange) {
          onPostChange(post.id, { comments: newCount });
        }
      }
    },
    [post, onPostChange]
  );

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback(
    (commentId: string) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      if (post) {
        const newCount = Math.max(0, (post.comments_count || 0) - 1);
        setPost((prev) =>
          prev ? { ...prev, comments_count: newCount } : null
        );

        if (onPostChange) {
          onPostChange(post.id, { comments: newCount });
        }
      }
    },
    [post, onPostChange]
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex h-[90vh]">
            <div className="w-1/2 bg-gray-100 animate-pulse" />
            <div className="w-1/2 p-4">
              <PostCardSkeleton />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 에러 상태
  if (error || !post) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">
              {error || "게시물을 찾을 수 없습니다."}
            </p>
            <Button onClick={onClose}>닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile 레이아웃
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full max-h-screen h-screen p-0 m-0 rounded-none">
          <div className="flex flex-col h-full">
            {/* 헤더 */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border h-[60px]">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-semibold text-text-primary">게시물</h2>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </header>

            {/* 이미지 */}
            <div
              className="w-full aspect-square relative bg-gray-100 cursor-pointer select-none"
              onDoubleClick={handleDoubleTap}
            >
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                draggable={false}
              />
              <DoubleTapHeart isAnimating={isDoubleTapAnimating} />
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto">
              {/* 사용자 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="hover:opacity-70"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      <span className="text-xs text-text-secondary">
                        {post.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-bold text-text-primary hover:opacity-70 block"
                    >
                      {post.user.name}
                    </Link>
                    <p className="text-text-secondary text-xs">
                      {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                </div>
                {currentUserId === post.user_id && (
                  <Button variant="ghost" size="sm" className="p-0">
                    <MoreHorizontal className="w-5 h-5 text-text-primary" />
                  </Button>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <LikeButton
                    ref={likeButtonRef}
                    postId={post.id}
                    initialLiked={post.is_liked || false}
                    initialLikesCount={post.likes_count}
                    onLikeChange={handleLikeChange}
                    size="md"
                    enableDoubleTap={true}
                  />
                </div>
              </div>

              {/* 좋아요 수 및 캡션 */}
              <div className="px-4 py-3 space-y-2 border-b border-border">
                {post.likes_count > 0 && (
                  <p className="font-bold text-text-primary">
                    좋아요 {post.likes_count.toLocaleString()}개
                  </p>
                )}
                {post.caption && (
                  <div className="text-text-primary">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-bold hover:opacity-70"
                    >
                      {post.user.name}
                    </Link>{" "}
                    <span>{post.caption}</span>
                  </div>
                )}
              </div>

              {/* 댓글 목록 */}
              {comments.length > 0 && (
                <CommentList
                  postId={post.id}
                  comments={comments}
                  maxVisible={undefined}
                  showAllLink={false}
                  onCommentDelete={handleCommentDelete}
                  currentUserId={currentUserId}
                  totalComments={post.comments_count}
                />
              )}

              {/* 댓글 입력 폼 */}
              <CommentForm
                postId={post.id}
                onSubmit={handleCommentSubmit}
                placeholder="댓글 달기..."
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop 레이아웃
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {/* 헤더 (닫기 + 네비게이션) */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-black/50 text-white">
          <div className="flex items-center gap-2">
            {hasPrevious && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="text-white hover:bg-white/20"
                aria-label="이전 게시물"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
          <div className="flex items-center gap-2">
            {hasNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="text-white hover:bg-white/20"
                aria-label="다음 게시물"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 h-[90vh]">
          {/* 좌측 이미지 영역 (50%) */}
          <div className="relative bg-gray-100">
            <div
              className="w-full h-full relative cursor-pointer select-none"
              onDoubleClick={handleDoubleTap}
            >
              <Image
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                fill
                className="object-contain"
                sizes="50vw"
                priority
                draggable={false}
              />
              <DoubleTapHeart isAnimating={isDoubleTapAnimating} />
            </div>
          </div>

          {/* 우측 컨텐츠 영역 (50%) */}
          <div className="flex flex-col overflow-hidden border-l border-border">
            {/* 사용자 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${post.user.id}`}
                  className="hover:opacity-70"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-text-secondary">
                      {post.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
                <div>
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="font-bold text-text-primary hover:opacity-70 block"
                  >
                    {post.user.name}
                  </Link>
                  <p className="text-text-secondary text-xs">
                    {formatRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>
              {currentUserId === post.user_id && (
                <Button variant="ghost" size="sm" className="p-0">
                  <MoreHorizontal className="w-5 h-5 text-text-primary" />
                </Button>
              )}
            </div>

            {/* 댓글 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto">
              {/* 액션 버튼 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <LikeButton
                    ref={likeButtonRef}
                    postId={post.id}
                    initialLiked={post.is_liked || false}
                    initialLikesCount={post.likes_count}
                    onLikeChange={handleLikeChange}
                    size="md"
                    enableDoubleTap={true}
                  />
                </div>
              </div>

              {/* 좋아요 수 및 캡션 */}
              <div className="px-4 py-3 space-y-2 border-b border-border">
                {post.likes_count > 0 && (
                  <p className="font-bold text-text-primary">
                    좋아요 {post.likes_count.toLocaleString()}개
                  </p>
                )}
                {post.caption && (
                  <div className="text-text-primary">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-bold hover:opacity-70"
                    >
                      {post.user.name}
                    </Link>{" "}
                    <span>{post.caption}</span>
                  </div>
                )}
              </div>

              {/* 댓글 목록 */}
              {isLoadingComments ? (
                <div className="px-4 py-8 text-center text-text-secondary">
                  댓글을 불러오는 중...
                </div>
              ) : comments.length > 0 ? (
                <CommentList
                  postId={post.id}
                  comments={comments}
                  maxVisible={undefined}
                  showAllLink={false}
                  onCommentDelete={handleCommentDelete}
                  currentUserId={currentUserId}
                  totalComments={post.comments_count}
                />
              ) : (
                <div className="px-4 py-8 text-center text-text-secondary">
                  댓글이 없습니다.
                </div>
              )}
            </div>

            {/* 댓글 입력 폼 */}
            <div className="border-t border-border flex-shrink-0">
              <CommentForm
                postId={post.id}
                onSubmit={handleCommentSubmit}
                placeholder="댓글 달기..."
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

