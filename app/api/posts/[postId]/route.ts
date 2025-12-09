/**
 * @file route.ts
 * @description 게시물 상세 API Route
 *
 * 특정 게시물의 상세 정보를 조회하는 API입니다.
 * - GET: 게시물 상세 정보 조회
 * - post_stats 뷰를 활용하여 좋아요/댓글 수 포함
 * - 사용자 정보 조인
 * - 현재 사용자의 좋아요 여부 확인
 *
 * @see .cursor/plans/게시물_상세_모달_상세_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { PostWithUser } from "@/lib/types";

/**
 * GET: 게시물 상세 정보 조회
 *
 * 경로 파라미터:
 * - postId: 게시물 ID (UUID)
 *
 * 응답:
 * {
 *   data: PostWithUser | null,
 *   error: string | null
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("GET /api/posts/[postId]");

    const { postId } = await params;

    if (!postId || typeof postId !== "string") {
      console.log("❌ 잘못된 요청: postId 필수");
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    console.log("📋 요청 데이터:", { postId });

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 인증 확인 (선택적 - 인증되지 않아도 조회 가능)
    const { userId: clerkUserId } = await auth();
    console.log("✅ 인증 상태:", clerkUserId ? "인증됨" : "비인증");

    // 게시물 정보 조회 (post_stats 뷰 활용)
    const { data: postStats, error: postStatsError } = await supabase
      .from("post_stats")
      .select("*")
      .eq("post_id", postId)
      .single();

    if (postStatsError || !postStats) {
      console.error("❌ 게시물 조회 실패:", postStatsError);
      return NextResponse.json(
        { error: "Post not found", details: postStatsError?.message },
        { status: 404 }
      );
    }

    // 게시물 기본 정보 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("❌ 게시물 조회 실패:", postError);
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", post.user_id)
      .single();

    if (userError || !user) {
      console.error("❌ 사용자 조회 실패:", userError);
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 현재 사용자의 좋아요 여부 확인 (인증된 경우만)
    let isLiked = false;
    if (clerkUserId) {
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (currentUser) {
        const { data: like } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", currentUser.id)
          .single();

        isLiked = !!like;
      }
    }

    // PostWithUser 형식으로 변환
    const postWithUser: PostWithUser = {
      id: post.id,
      user_id: post.user_id,
      image_url: post.image_url,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likes_count: Number(postStats.likes_count) || 0,
      comments_count: Number(postStats.comments_count) || 0,
      user: user,
      is_liked: isLiked,
    };

    console.log("✅ 게시물 조회 완료:", postId);
    console.groupEnd();

    return NextResponse.json({
      data: postWithUser,
      error: null,
    });
  } catch (error) {
    console.error("❌ GET /api/posts/[postId] 에러:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}

