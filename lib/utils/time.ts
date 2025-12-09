/**
 * @file time.ts
 * @description 시간 관련 유틸리티 함수
 *
 * 상대 시간 포맷팅 함수를 제공합니다.
 * 게시물 및 댓글의 작성 시간을 한국어로 표시합니다.
 */

/**
 * 상대 시간 포맷팅 함수
 *
 * 날짜 문자열을 받아 현재 시간과의 차이를 계산하여
 * 한국어로 상대 시간을 반환합니다.
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 한국어 상대 시간 문자열 (예: "3분 전", "1시간 전")
 *
 * @example
 * ```tsx
 * formatRelativeTime("2025-01-01T12:00:00Z")
 * // "방금 전" 또는 "3분 전" 등
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // 미래 시간인 경우 (클라이언트 시간 동기화 문제 등)
  if (diffInSeconds < 0) {
    return '방금 전';
  }

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}주 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

