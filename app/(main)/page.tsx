/**
 * @file page.tsx
 * @description 홈 피드 페이지 (인증된 사용자 전용)
 *
 * Instagram 스타일의 홈 피드 페이지입니다.
 * PostFeed 컴포넌트를 통해 게시물 목록을 표시합니다.
 *
 * @see docs/PRD.md - 홈 피드 기능 정의
 */

import PostFeed from '@/components/post/PostFeed';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background py-4">
      <PostFeed />
    </div>
  );
}

