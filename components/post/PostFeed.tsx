/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 렌더링하고 무한 스크롤을 제공합니다.
 * Intersection Observer를 사용하여 성능을 최적화합니다.
 *
 * @see docs/PRD.md - 홈 피드 기능 정의
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import PostModal from './PostModal';
import { useUser } from '@clerk/nextjs';
import type { PostWithUser } from '@/lib/types';

interface PostFeedProps {
  userId?: string; // 특정 사용자의 게시물만 표시 (프로필 페이지용)
}

export default function PostFeed({ userId }: PostFeedProps) {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 좋아요 변경 핸들러
  const handleLikeChange = useCallback((postId: string, liked: boolean, newCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, is_liked: liked, likes_count: newCount }
          : post
      )
    );
  }, []);

  // 댓글 변경 핸들러
  const handleCommentChange = useCallback((postId: string, newCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments_count: newCount }
          : post
      )
    );
  }, []);

  // 게시물 클릭 핸들러
  const handlePostClick = useCallback((postId: string) => {
    setSelectedPostId(postId);
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  // 모달에서 게시물 변경 핸들러
  const handlePostChange = useCallback((postId: string, changes: { likes?: number; comments?: number }) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...(changes.likes !== undefined && { likes_count: changes.likes }),
              ...(changes.comments !== undefined && { comments_count: changes.comments }),
            }
          : post
      )
    );
  }, []);

  // 게시물 삭제 핸들러
  const handlePostDelete = useCallback((postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    // 모달이 열려있고 삭제된 게시물이면 모달 닫기
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
  }, [selectedPostId]);

  // 현재 사용자의 Supabase UUID 조회 (Clerk user ID로)
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchCurrentUserId() {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error('현재 사용자 ID 조회 실패:', err);
      }
    }

    fetchCurrentUserId();
  }, [isLoaded, user]);

  // 게시물 로드 함수
  const loadPosts = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      const params = new URLSearchParams({
        limit: '10',
        offset: currentOffset.toString(),
      });
      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '게시물을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const newPosts = data.data || [];

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(data.has_more);
      setOffset(currentOffset + newPosts.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [userId]);

  // 초기 로드
  useEffect(() => {
    if (!isLoaded) return;
    loadPosts(0, false);
  }, [isLoaded, loadPosts]);

  // 무한 스크롤 설정
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadPosts(offset, true);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, offset, loadPosts]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary mb-4">{error}</p>
        <button
          onClick={() => loadPosts(0, false)}
          className="text-instagram-blue hover:opacity-70 font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${Math.min(index * 50, 300)}ms`,
              animationDuration: '0.3s',
              animationFillMode: 'both',
            }}
          >
            <PostCard 
              post={post} 
              currentUserId={currentUserId}
              onLikeChange={handleLikeChange}
              onCommentChange={handleCommentChange}
              onPostClick={handlePostClick}
              onDelete={handlePostDelete}
            />
          </div>
        ))}

        {/* 무한 스크롤 감지 요소 */}
        {hasMore && (
          <div ref={sentinelRef} className="h-4">
            {isLoadingMore && (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 게시물 상세 모달 */}
      <PostModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={handleCloseModal}
        onPostChange={handlePostChange}
        currentUserId={currentUserId}
        allPostIds={posts.map((p) => p.id)}
        onNavigate={setSelectedPostId}
      />
    </>
  );
}

