/**
 * @file route.ts
 * @description 게시물 API Route
 *
 * 게시물 목록 조회 API를 제공합니다.
 * - GET: 게시물 목록 조회 (시간 역순 정렬)
 * - 페이지네이션 지원 (limit, offset)
 * - 선택적 userId 파라미터 (프로필 페이지용)
 * - 현재 사용자의 좋아요 상태 포함
 *
 * @see .cursor/plans/홈_피드_페이지_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostWithUser } from "@/lib/types";

/**
 * GET: 게시물 목록 조회
 *
 * 쿼리 파라미터:
 * - limit: 페이지당 게시물 수 (기본값: 10, 최대: 50)
 * - offset: 건너뛸 게시물 수 (기본값: 0)
 * - userId: 특정 사용자의 게시물만 조회 (선택적)
 *
 * 응답 형식:
 * {
 *   data: PostWithUser[],
 *   has_more: boolean,
 *   next_offset?: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.group("GET /api/posts");

    // 1. 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log("❌ 인증 실패");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("✅ 인증 확인:", clerkUserId);

    // 2. 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10"),
      50
    );
    const offset = parseInt(searchParams.get("offset") || "0");
    const userId = searchParams.get("userId");

    console.log("📋 쿼리 파라미터:", { limit, offset, userId });

    // 3. Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 4. 현재 사용자 UUID 조회
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !currentUser) {
      console.error("❌ 사용자 조회 실패:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log("✅ 현재 사용자 UUID:", currentUser.id);

    // 5. 게시물 목록 조회 (post_stats 뷰 사용)
    let query = supabase
      .from("post_stats")
      .select(`
        post_id,
        user_id,
        image_url,
        caption,
        created_at,
        likes_count,
        comments_count,
        users!post_stats_user_id_fkey (
          id,
          clerk_id,
          name,
          created_at
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // userId 파라미터가 있으면 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error("❌ 게시물 조회 실패:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postsError.message },
        { status: 500 }
      );
    }

    console.log(`✅ 게시물 ${posts?.length || 0}개 조회됨`);

    // 6. 좋아요 상태 확인
    const postIds = posts?.map((p) => p.post_id) || [];
    let likedPostIds = new Set<string>();

    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUser.id)
        .in("post_id", postIds);

      likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
      console.log(`✅ 좋아요 상태 확인: ${likedPostIds.size}개 게시물에 좋아요`);
    }

    // 7. 응답 데이터 형식 변환
    const formattedPosts: PostWithUser[] = (posts || []).map((post) => ({
      id: post.post_id,
      user_id: post.user_id,
      image_url: post.image_url,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      user: {
        id: post.users.id,
        clerk_id: post.users.clerk_id,
        name: post.users.name,
        created_at: post.users.created_at,
      },
      is_liked: likedPostIds.has(post.post_id),
    }));

    // 8. 다음 페이지 존재 여부 확인
    const hasMore = formattedPosts.length === limit;

    console.log(`✅ 응답 준비 완료: ${formattedPosts.length}개 게시물, hasMore: ${hasMore}`);
    console.groupEnd();

    return NextResponse.json({
      data: formattedPosts,
      has_more: hasMore,
      next_offset: hasMore ? offset + limit : undefined,
    });
  } catch (error) {
    console.error("❌ GET /api/posts 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

