/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 특정 사용자의 프로필 페이지를 렌더링합니다.
 * - ProfileHeader: 프로필 정보 및 통계
 * - PostGrid: 게시물 그리드
 *
 * @see .cursor/plans/프로필_페이지_상세_개발_계획.md
 */

import { Suspense } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostGrid from "@/components/profile/PostGrid";
import ProfileHeaderSkeleton from "@/components/profile/ProfileHeaderSkeleton";
import PostGridSkeleton from "@/components/profile/PostGridSkeleton";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

async function ProfileContent({ userId }: { userId: string }) {
  const { userId: clerkUserId } = await auth();
  const supabase = createClerkSupabaseClient();
  
  // 현재 사용자 UUID 조회 (팔로우 버튼 표시용)
  let currentUserId: string | undefined;
  if (clerkUserId) {
    const { data: currentUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();
    
    currentUserId = currentUser?.id;
  }

  // userId가 "me"인 경우 현재 사용자로 처리
  let targetUserId: string | null = null;
  let isOwnProfile = false;

  if (userId === "me") {
    if (!currentUserId) {
      throw new Error("인증이 필요합니다.");
    }
    targetUserId = currentUserId;
    isOwnProfile = true;
  } else {
    // UUID인지 Clerk ID인지 확인
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    if (isUUID) {
      targetUserId = userId;
    } else {
      // Clerk ID로 조회
      const { data: userByClerkId } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!userByClerkId) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      targetUserId = userByClerkId.id;
    }

    isOwnProfile = currentUserId === targetUserId;
  }

  // user_stats 뷰에서 사용자 정보 조회
  const { data: userStats, error: userStatsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  if (userStatsError || !userStats) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  // 사용자 기본 정보 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("id", targetUserId)
    .single();

  if (userError || !user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  // 팔로우 상태 확인 (인증된 사용자이고 본인 프로필이 아닌 경우)
  let isFollowing = false;
  if (currentUserId && !isOwnProfile) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", targetUserId)
      .single();

    isFollowing = !!follow;
  }

  // 프로필 데이터 구성
  const profile = {
    id: user.id,
    clerk_id: user.clerk_id,
    name: user.name,
    created_at: user.created_at,
    posts_count: Number(userStats.posts_count) || 0,
    followers_count: Number(userStats.followers_count) || 0,
    following_count: Number(userStats.following_count) || 0,
    ...(currentUserId && { is_following: isFollowing }),
    is_own_profile: isOwnProfile,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[935px] mx-auto px-4 py-6">
        <ProfileHeader
          user={profile}
          currentUserId={currentUserId}
        />
        <PostGrid
          userId={profile.id}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="max-w-[935px] mx-auto px-4 py-6">
            <ProfileHeaderSkeleton />
            <PostGridSkeleton />
          </div>
        </div>
      }
    >
      <ProfileContent userId={userId} />
    </Suspense>
  );
}

