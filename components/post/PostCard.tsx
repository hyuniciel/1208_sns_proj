/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드를 렌더링합니다.
 * 헤더, 이미지, 액션 버튼, 컨텐츠를 포함합니다.
 *
 * @see docs/PRD.md - PostCard 디자인
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/time';
import LikeButton, { DoubleTapHeart, type LikeButtonRef } from './LikeButton';
import CommentList from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import type { PostWithUser, CommentWithUser } from '@/lib/types';

interface PostCardProps {
  post: PostWithUser;
  currentUserId?: string; // 현재 사용자 ID (삭제 버튼 표시용)
  onLikeChange?: (postId: string, liked: boolean, newCount: number) => void;
  onCommentChange?: (postId: string, newCount: number) => void;
  onPostClick?: (postId: string) => void; // 게시물 클릭 시 모달 열기
}

export default function PostCard({ post, currentUserId, onLikeChange, onCommentChange, onPostClick }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [isDoubleTapAnimating, setIsDoubleTapAnimating] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const likeButtonRef = useRef<LikeButtonRef>(null);
  const lastTapRef = useRef(0);

  // 캡션이 2줄을 초과하는지 간단히 체크 (실제로는 ref로 정확히 계산 가능)
  const captionLength = post.caption?.length || 0;
  const shouldTruncate = captionLength > 100; // 대략적인 기준
  const displayCaption = shouldTruncate && !showFullCaption
    ? post.caption?.substring(0, 100) + '...'
    : post.caption;

  // 더블탭 핸들러
  const handleDoubleTap = useCallback(() => {
    if (isLiked) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms 내 두 번 탭하면 더블탭으로 간주

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // 더블탭 감지
      setIsDoubleTapAnimating(true);
      likeButtonRef.current?.handleDoubleTap();
      
      // 애니메이션 종료 (1초 후)
      setTimeout(() => setIsDoubleTapAnimating(false), 1000);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [isLiked]);

  // 좋아요 변경 핸들러
  const handleLikeChange = useCallback((liked: boolean, newCount: number) => {
    setIsLiked(liked);
    setLikesCount(newCount);
    
    // 부모 컴포넌트에 알림
    if (onLikeChange) {
      onLikeChange(post.id, liked, newCount);
    }
  }, [post.id, onLikeChange]);

  // 댓글 목록 로드
  const loadComments = useCallback(async (showAll: boolean = false) => {
    if (isLoadingComments) return;

    setIsLoadingComments(true);
    try {
      const limit = showAll ? 50 : 2;
      const response = await fetch(
        `/api/comments?post_id=${post.id}&limit=${limit}&offset=0`
      );

      if (!response.ok) {
        throw new Error('댓글을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('❌ 댓글 로드 에러:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, isLoadingComments]);

  // 초기 댓글 로드 (최신 2개만)
  useEffect(() => {
    if (post.comments_count > 0) {
      loadComments(false);
    }
  }, [post.comments_count]); // eslint-disable-line react-hooks/exhaustive-deps

  // 댓글 작성 핸들러
  const handleCommentSubmit = useCallback((newComment: CommentWithUser) => {
    setComments((prev) => {
      // 중복 방지
      if (prev.some((c) => c.id === newComment.id)) {
        return prev;
      }
      return [...prev, newComment];
    });
    setCommentsCount((prev) => prev + 1);
    
    // 부모 컴포넌트에 알림
    if (onCommentChange) {
      onCommentChange(post.id, commentsCount + 1);
    }
  }, [post.id, commentsCount, onCommentChange]);

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
    
    // 부모 컴포넌트에 알림
    if (onCommentChange) {
      onCommentChange(post.id, Math.max(0, commentsCount - 1));
    }
  }, [post.id, commentsCount, onCommentChange]);

  // "모두 보기" 핸들러
  const handleShowAllComments = useCallback(() => {
    if (!showAllComments) {
      setShowAllComments(true);
      loadComments(true);
    } else {
      setShowAllComments(false);
      loadComments(false);
    }
  }, [showAllComments, loadComments]);

  return (
    <article className="bg-card-background border border-border rounded-lg mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.id}`} className="hover:opacity-70">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {/* 프로필 이미지 (Clerk 또는 기본 아바타) - 나중에 구현 */}
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

        {/* ⋯ 메뉴 (본인 게시물만) - 나중에 dropdown-menu로 구현 */}
        {currentUserId === post.user_id && (
          <Button variant="ghost" size="sm" className="p-0">
            <MoreHorizontal className="w-5 h-5 text-text-primary" />
          </Button>
        )}
      </header>

      {/* 이미지 */}
      <div 
        className="w-full aspect-square relative bg-gray-100 cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
        onClick={() => onPostClick?.(post.id)}
      >
        <Image
          src={post.image_url}
          alt={post.caption || '게시물 이미지'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          loading="lazy"
          draggable={false}
        />
        <DoubleTapHeart isAnimating={isDoubleTapAnimating} />
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <LikeButton
            ref={likeButtonRef}
            postId={post.id}
            initialLiked={isLiked}
            initialLikesCount={likesCount}
            onLikeChange={handleLikeChange}
            size="md"
            enableDoubleTap={true}
          />
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
            <MessageCircle className="w-6 h-6 text-text-primary" />
          </Button>
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
            <Send className="w-6 h-6 text-text-primary" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
          <Bookmark className="w-6 h-6 text-text-primary" />
        </Button>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <p className="font-bold text-text-primary">
            좋아요 {likesCount.toLocaleString()}개
          </p>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-text-primary">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-bold hover:opacity-70"
            >
              {post.user.name}
            </Link>
            {' '}
            <span>{displayCaption}</span>
            {shouldTruncate && !showFullCaption && (
              <button
                onClick={() => setShowFullCaption(true)}
                className="text-text-secondary hover:text-text-primary ml-1"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <CommentList
            postId={post.id}
            comments={comments}
            maxVisible={showAllComments ? undefined : 2}
            showAllLink={commentsCount > 2}
            onCommentDelete={handleCommentDelete}
            currentUserId={currentUserId}
            onShowAll={handleShowAllComments}
            totalComments={commentsCount}
          />
        )}

        {/* 댓글 입력 폼 */}
        <CommentForm
          postId={post.id}
          onSubmit={handleCommentSubmit}
          placeholder="댓글 달기..."
        />
      </div>
    </article>
  );
}

