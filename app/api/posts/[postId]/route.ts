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
import { getServiceRoleClient } from "@/lib/supabase/service-role";
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

/**
 * DELETE: 게시물 삭제
 *
 * 경로 파라미터:
 * - postId: 게시물 ID (UUID)
 *
 * 응답:
 * {
 *   success: true,
 *   message: "Post deleted successfully"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("DELETE /api/posts/[postId]");

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

    const { postId } = await params;

    if (!postId || typeof postId !== "string") {
      console.log("❌ 잘못된 요청: postId 필수");
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { postId });

    // 2. Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 3. 현재 사용자 UUID 조회
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

    // 4. 게시물 존재 및 소유권 확인
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, image_url")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("❌ 게시물 조회 실패:", postError);
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 5. 소유권 검증 (본인 게시물만 삭제 가능)
    if (post.user_id !== currentUser.id) {
      console.log("❌ 권한 없음: 본인 게시물만 삭제 가능");
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own posts" },
        { status: 403 }
      );
    }
    console.log("✅ 소유권 확인 완료");

    // 6. Supabase Storage에서 이미지 삭제
    // image_url에서 파일 경로 추출
    // 예시: https://[project].supabase.co/storage/v1/object/public/posts/user123/1234567890-abc123.jpg
    let filePath: string | null = null;
    try {
      const url = new URL(post.image_url);
      const pathMatch = url.pathname.match(/\/posts\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        // 쿼리 파라미터 제거
        filePath = pathMatch[1].split("?")[0];
      }
    } catch (error) {
      console.warn("⚠️ 이미지 URL 파싱 실패:", error);
    }

    if (filePath) {
      console.log("📤 Storage 파일 삭제 시작:", filePath);
      const { error: storageError } = await supabase.storage
        .from("posts")
        .remove([filePath]);

      if (storageError) {
        console.error("⚠️ Storage 파일 삭제 실패:", storageError);
        // DB 삭제는 계속 진행 (선택적)
      } else {
        console.log("✅ Storage 파일 삭제 완료:", filePath);
      }
    } else {
      console.warn("⚠️ 파일 경로 추출 실패, Storage 삭제 건너뜀");
    }

    // 7. DB에서 게시물 삭제 (CASCADE로 좋아요/댓글 자동 삭제)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("❌ 게시물 삭제 실패:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete post", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ 게시물 삭제 완료:", postId);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/posts/[postId] 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

