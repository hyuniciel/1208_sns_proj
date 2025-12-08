/**
 * @file page.tsx
 * @description 홈 피드 페이지 (인증된 사용자 전용)
 *
 * Instagram 스타일의 홈 피드 페이지입니다.
 * 게시물 목록이 표시됩니다 (나중에 구현).
 *
 * @see docs/PRD.md - 홈 피드 기능 정의
 */

export default function HomePage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">홈 피드</h1>
      <p className="text-text-secondary">
        게시물 목록이 여기에 표시됩니다.
      </p>
    </div>
  );
}

