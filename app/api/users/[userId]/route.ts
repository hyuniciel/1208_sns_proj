/**
 * @file route.ts
 * @description 사용자 프로필 API Route
 *
 * 특정 사용자의 프로필 정보를 조회하는 API입니다.
 * - GET: 사용자 프로필 정보 조회
 * - user_stats 뷰를 활용하여 통계 포함
 * - 현재 사용자의 팔로우 상태 확인
 * - 본인 프로필 구분
 *
 * @see .cursor/plans/프로필_페이지_상세_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * GET: 사용자 프로필 정보 조회
 *
 * 경로 파라미터:
 * - userId: 사용자 ID (UUID 또는 "me")
 *
 * 응답:
 * {
 *   data: {
 *     id: string;
 *     clerk_id: string;
 *     name: string;
 *     created_at: string;
 *     posts_count: number;
 *     followers_count: number;
 *     following_count: number;
 *     is_following?: boolean;
 *     is_own_profile?: boolean;
 *   } | null,
 *   error: string | null
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    console.group("GET /api/users/[userId]");

    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    console.log("📋 요청 데이터:", { userId, clerkUserId });

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 UUID 조회 (인증된 경우)
    let currentUserUuid: string | null = null;
    if (clerkUserId) {
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      currentUserUuid = currentUser?.id || null;
      console.log("✅ 현재 사용자 UUID:", currentUserUuid);
    }

    // userId가 "me"인 경우 현재 사용자로 처리
    let targetUserId: string | null = null;
    let isOwnProfile = false;

    if (userId === "me") {
      if (!currentUserUuid) {
        console.log("❌ 인증 필요: 'me'는 인증된 사용자만 사용 가능");
        return NextResponse.json(
          { error: "Unauthorized", data: null },
          { status: 401 }
        );
      }
      targetUserId = currentUserUuid;
      isOwnProfile = true;
    } else {
      // UUID인지 Clerk ID인지 확인
      // UUID 형식: 8-4-4-4-12 (36자)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      );

      if (isUUID) {
        targetUserId = userId;
      } else {
        // Clerk ID로 조회 시도
        const { data: userByClerkId } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", userId)
          .single();

        if (!userByClerkId) {
          console.log("❌ 사용자를 찾을 수 없음:", userId);
          return NextResponse.json(
            { error: "User not found", data: null },
            { status: 404 }
          );
        }

        targetUserId = userByClerkId.id;
      }

      // 본인 프로필인지 확인
      isOwnProfile = currentUserUuid === targetUserId;
    }

    console.log("✅ 대상 사용자 UUID:", targetUserId, "본인 프로필:", isOwnProfile);

    // user_stats 뷰에서 사용자 정보 조회
    const { data: userStats, error: userStatsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    if (userStatsError || !userStats) {
      console.error("❌ 사용자 통계 조회 실패:", userStatsError);
      return NextResponse.json(
        { error: "User not found", data: null, details: userStatsError?.message },
        { status: 404 }
      );
    }

    // 사용자 기본 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", targetUserId)
      .single();

    if (userError || !user) {
      console.error("❌ 사용자 정보 조회 실패:", userError);
      return NextResponse.json(
        { error: "User not found", data: null, details: userError?.message },
        { status: 404 }
      );
    }

    // 팔로우 상태 확인 (인증된 사용자이고 본인 프로필이 아닌 경우)
    let isFollowing = false;
    if (currentUserUuid && !isOwnProfile) {
      const { data: follow } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserUuid)
        .eq("following_id", targetUserId)
        .single();

      isFollowing = !!follow;
      console.log("✅ 팔로우 상태:", isFollowing);
    }

    // 응답 데이터 구성
    const profileData = {
      id: user.id,
      clerk_id: user.clerk_id,
      name: user.name,
      created_at: user.created_at,
      posts_count: Number(userStats.posts_count) || 0,
      followers_count: Number(userStats.followers_count) || 0,
      following_count: Number(userStats.following_count) || 0,
      ...(currentUserUuid && { is_following: isFollowing }),
      is_own_profile: isOwnProfile,
    };

    console.log("✅ 프로필 정보 조회 완료");
    console.groupEnd();

    return NextResponse.json({
      data: profileData,
      error: null,
    });
  } catch (error) {
    console.error("❌ GET /api/users/[userId] 에러:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
}

