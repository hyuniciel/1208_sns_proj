/**
 * @file PostGridSkeleton.tsx
 * @description 게시물 그리드 스켈레톤 컴포넌트
 *
 * 게시물 그리드 로딩 중 표시되는 스켈레톤 UI입니다.
 */

export default function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-1.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square shimmer"
        />
      ))}
    </div>
  );
}

