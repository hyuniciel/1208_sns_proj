/**
 * @file types.ts
 * @description Instagram Clone SNS 프로젝트의 TypeScript 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스 스키마를 기반으로 한 타입 정의를 포함합니다.
 * 모든 타입은 DB 스키마와 일치하도록 정의되었습니다.
 *
 * @see supabase/migrations/db.sql - 데이터베이스 스키마
 */

// ============================================
// 기본 엔티티 타입 (DB 스키마 기반)
// ============================================

/**
 * 사용자 타입
 * @see public.users 테이블
 */
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk User ID (Unique)
  name: string;
  created_at: string; // ISO 8601 timestamp
}

/**
 * 게시물 타입
 * @see public.posts 테이블
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID (users.id 참조)
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자 (애플리케이션에서 검증)
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * 좋아요 타입
 * @see public.likes 테이블
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  created_at: string; // ISO 8601 timestamp
}

/**
 * 댓글 타입
 * @see public.comments 테이블
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID (posts.id 참조)
  user_id: string; // UUID (users.id 참조)
  content: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * 팔로우 타입
 * @see public.follows 테이블
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (users.id 참조) - 팔로우하는 사람
  following_id: string; // UUID (users.id 참조) - 팔로우받는 사람
  created_at: string; // ISO 8601 timestamp
}

// ============================================
// 확장 타입 (Views 및 조인 결과)
// ============================================

/**
 * 게시물 통계 포함 타입
 * @see public.post_stats 뷰
 */
export interface PostWithStats extends Post {
  likes_count: number;
  comments_count: number;
}

/**
 * 사용자 통계 포함 타입
 * @see public.user_stats 뷰
 */
export interface UserWithStats extends User {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

/**
 * 게시물 + 사용자 정보 타입 (API 응답용)
 * 피드에서 사용하는 주요 타입
 */
export interface PostWithUser extends PostWithStats {
  user: User;
  is_liked?: boolean; // 현재 사용자가 좋아요 했는지 (클라이언트에서 계산)
}

/**
 * 댓글 + 사용자 정보 타입
 */
export interface CommentWithUser extends Comment {
  user: User;
}

// ============================================
// API 응답 타입
// ============================================

/**
 * 표준 API 응답 타입
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * 페이지네이션 응답 타입
 * @template T - 데이터 배열의 아이템 타입
 */
export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  next_cursor?: string; // 다음 페이지를 가져오기 위한 커서
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 게시물 생성 요청 타입 (이미지 제외)
 */
export interface CreatePostInput {
  image_url: string;
  caption: string | null;
}

/**
 * 댓글 생성 요청 타입
 */
export interface CreateCommentInput {
  post_id: string;
  content: string;
}

