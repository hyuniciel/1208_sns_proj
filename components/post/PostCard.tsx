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

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/time';
import type { PostWithUser } from '@/lib/types';

interface PostCardProps {
  post: PostWithUser;
  currentUserId?: string; // 현재 사용자 ID (삭제 버튼 표시용)
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);

  // 캡션이 2줄을 초과하는지 간단히 체크 (실제로는 ref로 정확히 계산 가능)
  const captionLength = post.caption?.length || 0;
  const shouldTruncate = captionLength > 100; // 대략적인 기준
  const displayCaption = shouldTruncate && !showFullCaption
    ? post.caption?.substring(0, 100) + '...'
    : post.caption;

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
      <div className="w-full aspect-square relative bg-gray-100">
        <Image
          src={post.image_url}
          alt={post.caption || '게시물 이미지'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          loading="lazy"
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
            <Heart
              className={`w-6 h-6 transition-colors ${
                post.is_liked
                  ? 'fill-like text-like'
                  : 'text-text-primary'
              }`}
            />
          </Button>
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
        {post.likes_count > 0 && (
          <p className="font-bold text-text-primary">
            좋아요 {post.likes_count.toLocaleString()}개
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

        {/* 댓글 미리보기 (나중에 구현) */}
        {post.comments_count > 0 && (
          <button className="text-text-secondary text-sm hover:text-text-primary">
            댓글 {post.comments_count}개 모두 보기
          </button>
        )}
      </div>
    </article>
  );
}

