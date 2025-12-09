/**
 * @file route.ts
 * @description 댓글 API Route
 *
 * 댓글 작성/삭제/조회 API를 제공합니다.
 * - GET: 댓글 목록 조회 (선택적)
 * - POST: 댓글 작성
 * - DELETE: 댓글 삭제 (본인만)
 * - 인증 검증 (Clerk)
 *
 * @see .cursor/plans/댓글_기능_상세_개발_계획.md
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CommentWithUser } from "@/lib/types";

/**
 * GET: 댓글 목록 조회 (선택적)
 *
 * 쿼리 파라미터:
 * - post_id: 게시물 ID (필수)
 * - limit: 최대 댓글 수 (기본값: 50)
 * - offset: 건너뛸 댓글 수 (기본값: 0)
 *
 * 응답:
 * {
 *   comments: CommentWithUser[],
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.group("GET /api/comments");

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("post_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!postId) {
      console.log("❌ 잘못된 요청: post_id 필수");
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    console.log("📋 쿼리 파라미터:", { postId, limit, offset });

    const supabase = createClerkSupabaseClient();

    // 댓글 목록 조회
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      console.error("❌ 댓글 조회 실패:", commentsError);
      return NextResponse.json(
        { error: "Failed to fetch comments", details: commentsError.message },
        { status: 500 }
      );
    }

    // 사용자 정보 별도 조회
    const userIds = [...new Set(comments?.map((c) => c.user_id) || [])];
    let usersMap = new Map<
      string,
      { id: string; clerk_id: string; name: string; created_at: string }
    >();

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, clerk_id, name, created_at")
        .in("id", userIds);

      if (usersError) {
        console.error("❌ 사용자 정보 조회 실패:", usersError);
      } else {
        usersMap = new Map(users?.map((u) => [u.id, u]) || []);
      }
    }

    // 총 댓글 수 조회
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    // CommentWithUser 형식으로 변환
    const commentsWithUser: CommentWithUser[] = (comments || []).map(
      (comment) => {
        const user = usersMap.get(comment.user_id);
        return {
          ...comment,
          user:
            user ||
            ({
              id: comment.user_id,
              clerk_id: "",
              name: "Unknown",
              created_at: comment.created_at,
            } as CommentWithUser["user"]),
        };
      }
    );

    console.log(`✅ 댓글 ${commentsWithUser.length}개 조회됨 (전체: ${count || 0}개)`);
    console.groupEnd();

    return NextResponse.json({
      comments: commentsWithUser,
      total: count || 0,
    });
  } catch (error) {
    console.error("❌ GET /api/comments 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: 댓글 작성
 *
 * 요청 본문:
 * {
 *   post_id: string (UUID),
 *   content: string
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   comment: CommentWithUser
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("POST /api/comments");

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
    const { post_id, content } = body;

    if (!post_id || typeof post_id !== "string") {
      console.log("❌ 잘못된 요청: post_id 필수");
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      console.log("❌ 잘못된 요청: content 필수");
      return NextResponse.json(
        { error: "content is required and cannot be empty" },
        { status: 400 }
      );
    }

    console.log("📋 요청 데이터:", {
      post_id,
      contentLength: content.length,
    });

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

    // 6. 댓글 저장
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id,
        user_id: currentUser.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (commentError) {
      console.error("❌ 댓글 저장 실패:", commentError);
      return NextResponse.json(
        { error: "Failed to create comment", details: commentError.message },
        { status: 500 }
      );
    }

    // 7. 사용자 정보 포함하여 응답
    const { data: user } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", currentUser.id)
      .single();

    const commentWithUser: CommentWithUser = {
      ...comment,
      user:
        user ||
        ({
          id: currentUser.id,
          clerk_id: clerkUserId,
          name: "Unknown",
          created_at: comment.created_at,
        } as CommentWithUser["user"]),
    };

    console.log("✅ 댓글 작성 완료:", comment.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      comment: commentWithUser,
    });
  } catch (error) {
    console.error("❌ POST /api/comments 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 댓글 삭제
 *
 * 요청 본문:
 * {
 *   comment_id: string (UUID)
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   message: "Comment deleted"
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("DELETE /api/comments");

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
    const { comment_id } = body;

    if (!comment_id || typeof comment_id !== "string") {
      console.log("❌ 잘못된 요청: comment_id 필수");
      return NextResponse.json(
        { error: "comment_id is required" },
        { status: 400 }
      );
    }
    console.log("📋 요청 데이터:", { comment_id });

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

    // 5. 댓글 존재 및 소유권 확인
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, user_id")
      .eq("id", comment_id)
      .single();

    if (commentError || !comment) {
      console.error("❌ 댓글 조회 실패:", commentError);
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.user_id !== currentUser.id) {
      console.log("❌ 권한 없음: 본인 댓글만 삭제 가능");
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own comments" },
        { status: 403 }
      );
    }

    // 6. 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment_id);

    if (deleteError) {
      console.error("❌ 댓글 삭제 실패:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("✅ 댓글 삭제 완료");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("❌ DELETE /api/comments 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

