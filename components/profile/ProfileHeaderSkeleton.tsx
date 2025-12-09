/**
 * @file ProfileHeaderSkeleton.tsx
 * @description 프로필 헤더 스켈레톤 컴포넌트
 *
 * 프로필 헤더 로딩 중 표시되는 스켈레톤 UI입니다.
 */

export default function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-4 py-6">
      {/* 프로필 이미지 스켈레톤 */}
      <div className="flex-shrink-0">
        <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full shimmer" />
      </div>

      {/* 정보 영역 스켈레톤 */}
      <div className="flex-1 space-y-4">
        {/* 사용자명 및 버튼 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-8 w-32 rounded shimmer" />
          <div className="h-8 w-24 rounded shimmer" />
        </div>

        {/* 통계 스켈레톤 */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="h-5 w-20 rounded shimmer" />
          <div className="h-5 w-20 rounded shimmer" />
          <div className="h-5 w-20 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

