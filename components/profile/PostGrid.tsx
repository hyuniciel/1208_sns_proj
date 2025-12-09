/**
 * @file PostGrid.tsx
 * @description 게시물 그리드 컴포넌트
 *
 * Instagram 스타일의 3열 게시물 그리드를 렌더링합니다.
 * - 3열 그리드 레이아웃
 * - 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 *
 * @see .cursor/plans/프로필_페이지_상세_개발_계획.md
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import PostModal from "@/components/post/PostModal";
import type { PostWithUser } from "@/lib/types";

interface PostGridProps {
  userId: string;
  onPostClick?: (postId: string) => void;
  currentUserId?: string;
}

interface PostThumbnail {
  id: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
}

export default function PostGrid({
  userId,
  onPostClick,
  currentUserId,
}: PostGridProps) {
  const [posts, setPosts] = useState<PostThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // 게시물 목록 로드
  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/posts?userId=${userId}&limit=100&offset=0`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "게시물을 불러올 수 없습니다.");
        }

        const data = await response.json();
        const postsData = data.data || [];

        // 썸네일용 데이터만 추출
        const thumbnails: PostThumbnail[] = postsData.map((post: PostWithUser) => ({
          id: post.id,
          image_url: post.image_url,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
        }));

        setPosts(thumbnails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadPosts();
    }
  }, [userId]);

  const handlePostClick = useCallback(
    (postId: string) => {
      setSelectedPostId(postId);
      if (onPostClick) {
        onPostClick(postId);
      }
    },
    [onPostClick]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  const handlePostChange = useCallback(
    (postId: string, changes: { likes?: number; comments?: number }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                ...(changes.likes !== undefined && {
                  likes_count: changes.likes,
                }),
                ...(changes.comments !== undefined && {
                  comments_count: changes.comments,
                }),
              }
            : post
        )
      );
    },
    []
  );

  // 게시물 삭제 핸들러
  const handlePostDelete = useCallback((postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    // 모달이 열려있고 삭제된 게시물이면 모달 닫기
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
  }, [selectedPostId]);

  if (isLoading) {
    return <PostGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-instagram-blue hover:opacity-70 font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-text-secondary flex items-center justify-center">
          <svg
            className="w-8 h-8 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-text-secondary font-semibold">게시물 없음</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-1.5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 group cursor-pointer overflow-hidden"
            onClick={() => handlePostClick(post.id)}
          >
            <Image
              src={post.image_url}
              alt="게시물"
              fill
              className="object-cover image-fade-in"
              sizes="(max-width: 768px) 33vw, 310px"
              loading="lazy"
            />
            {/* Hover 오버레이 (Desktop) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white md:flex hidden">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-semibold">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="font-semibold">{post.comments_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={handleCloseModal}
        onPostChange={handlePostChange}
        onDelete={handlePostDelete}
        currentUserId={currentUserId}
        allPostIds={posts.map((p) => p.id)}
        onNavigate={setSelectedPostId}
      />
    </>
  );
}

