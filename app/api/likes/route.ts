/**
 * @file route.ts
 * @description 좋아요 API Route
 *
 * 좋아요 추가/제거 API를 제공합니다.
 * - POST: 좋아요 추가
 * - DELETE: 좋아요 제거
 * - 인증 검증 (Clerk)
 * - 중복 좋아요 방지 (DB 제약조건 활용)
 *
 * @see .cursor/plans/좋아요_기능_상세_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { Like } from "@/lib/types";

/**
 * POST: 좋아요 추가
 *
 * 요청 본문:
 * {
 *   post_id: string (UUID)
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   like: Like
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("POST /api/likes");

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

    // 2. 요청 본문 파싱
    const body = await request.json();
    const { post_id } = body;

    if (!post_id || typeof post_id !== "string") {
      console.log("❌ 잘못된 요청: post_id 필수");
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { post_id });

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

    // 5. 게시물 존재 확인
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      console.error("❌ 게시물 조회 실패:", postError);
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    console.log("✅ 게시물 확인:", post.id);

    // 6. 좋아요 추가
    const { data: like, error: likeError } = await supabase
      .from("likes")
      .insert({
        post_id,
        user_id: currentUser.id,
      })
      .select()
      .single();

    if (likeError) {
      // 중복 좋아요 에러 처리 (PostgreSQL unique violation)
      if (likeError.code === "23505") {
        console.log("⚠️ 이미 좋아요한 게시물");
        return NextResponse.json(
          { error: "Already liked" },
          { status: 409 }
        );
      }

      console.error("❌ 좋아요 추가 실패:", likeError);
      return NextResponse.json(
        { error: "Failed to add like", details: likeError.message },
        { status: 500 }
      );
    }

    console.log("✅ 좋아요 추가 완료:", like.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      like,
    });
  } catch (error) {
    console.error("❌ POST /api/likes 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 좋아요 제거
 *
 * 요청 본문:
 * {
 *   post_id: string (UUID)
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   message: "Like removed"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("DELETE /api/likes");

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

    // 2. 요청 본문 파싱
    const body = await request.json();
    const { post_id } = body;

    if (!post_id || typeof post_id !== "string") {
      console.log("❌ 잘못된 요청: post_id 필수");
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { post_id });

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

    // 5. 좋아요 제거
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", currentUser.id);

    if (deleteError) {
      console.error("❌ 좋아요 제거 실패:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove like", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ 좋아요 제거 완료");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Like removed",
    });
  } catch (error) {
    console.error("❌ DELETE /api/likes 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

