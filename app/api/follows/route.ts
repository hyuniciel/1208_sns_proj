/**
 * @file route.ts
 * @description 팔로우 API Route
 *
 * 팔로우 추가/제거 API를 제공합니다.
 * - POST: 팔로우 추가
 * - DELETE: 팔로우 제거
 * - 인증 검증 (Clerk)
 * - 자기 자신 팔로우 방지
 * - 중복 팔로우 방지
 *
 * @see .cursor/plans/팔로우_기능_상세_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { Follow } from "@/lib/types";

/**
 * POST: 팔로우 추가
 *
 * 요청 본문:
 * {
 *   following_id: string (UUID) - 팔로우할 사용자 ID
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   follow: Follow
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("POST /api/follows");

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
    const { following_id } = body;

    if (!following_id || typeof following_id !== "string") {
      console.log("❌ 잘못된 요청: following_id 필수");
      return NextResponse.json(
        { error: "following_id is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { following_id });

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

    // 5. 자기 자신 팔로우 방지
    if (currentUser.id === following_id) {
      console.log("❌ 자기 자신 팔로우 시도");
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // 6. 팔로우할 사용자 존재 확인
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", following_id)
      .single();

    if (targetUserError || !targetUser) {
      console.error("❌ 대상 사용자 조회 실패:", targetUserError);
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }
    console.log("✅ 대상 사용자 확인:", targetUser.id);

    // 7. 중복 팔로우 확인
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", following_id)
      .single();

    if (existingFollow) {
      console.log("❌ 이미 팔로우 중");
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // 8. 팔로우 추가
    const { data: follow, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUser.id,
        following_id: following_id,
      })
      .select()
      .single();

    if (followError) {
      console.error("❌ 팔로우 추가 실패:", followError);
      // UNIQUE 제약 위반인 경우
      if (followError.code === "23505") {
        return NextResponse.json(
          { error: "Already following this user" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to follow user", details: followError.message },
        { status: 500 }
      );
    }

    console.log("✅ 팔로우 추가 완료:", follow.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      follow: follow as Follow,
    });
  } catch (error) {
    console.error("❌ POST /api/follows 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 팔로우 제거
 *
 * 요청 본문:
 * {
 *   following_id: string (UUID) - 언팔로우할 사용자 ID
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   message: "Unfollowed successfully"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("DELETE /api/follows");

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
    const { following_id } = body;

    if (!following_id || typeof following_id !== "string") {
      console.log("❌ 잘못된 요청: following_id 필수");
      return NextResponse.json(
        { error: "following_id is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { following_id });

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

    // 5. 팔로우 관계 존재 및 권한 확인
    const { data: follow, error: followError } = await supabase
      .from("follows")
      .select("id, follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", following_id)
      .single();

    if (followError || !follow) {
      console.error("❌ 팔로우 관계 조회 실패:", followError);
      return NextResponse.json(
        { error: "Follow relationship not found" },
        { status: 404 }
      );
    }

    // 6. 권한 확인 (본인의 팔로우만 삭제 가능)
    if (follow.follower_id !== currentUser.id) {
      console.log("❌ 권한 없음: 본인의 팔로우만 삭제 가능");
      return NextResponse.json(
        { error: "Forbidden: You can only unfollow users you are following" },
        { status: 403 }
      );
    }

    // 7. 팔로우 제거
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("id", follow.id);

    if (deleteError) {
      console.error("❌ 팔로우 제거 실패:", deleteError);
      return NextResponse.json(
        { error: "Failed to unfollow user", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ 팔로우 제거 완료");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/follows 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

