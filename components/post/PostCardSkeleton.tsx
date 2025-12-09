/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 스켈레톤 UI 컴포넌트
 *
 * 로딩 중 PostCard의 스켈레톤 UI를 표시합니다.
 * Shimmer 애니메이션 효과를 포함합니다.
 *
 * @see docs/PRD.md - PostCard 디자인
 */

export default function PostCardSkeleton() {
  return (
    <div className="bg-card-background border border-border rounded-lg mb-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 h-[60px]">
        <div className="w-8 h-8 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="h-3 w-16 rounded shimmer" />
        </div>
      </div>

      {/* 이미지 */}
      <div className="w-full aspect-square shimmer" />

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded shimmer" />
          <div className="w-6 h-6 rounded shimmer" />
          <div className="w-6 h-6 rounded shimmer" />
        </div>
        <div className="w-6 h-6 rounded shimmer" />
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-4 w-32 rounded shimmer" />
        <div className="space-y-1">
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-3/4 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

