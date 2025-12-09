/**
 * @file page.tsx
 * @description 본인 프로필 페이지 (리다이렉트)
 *
 * /profile 접근 시 현재 사용자의 프로필로 리다이렉트합니다.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // 현재 사용자 UUID 조회
  const supabase = createClerkSupabaseClient();
  const { data: currentUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (!currentUser) {
    redirect("/sign-in");
  }

  // 본인 프로필로 리다이렉트
  redirect(`/profile/${currentUser.id}`);
}

