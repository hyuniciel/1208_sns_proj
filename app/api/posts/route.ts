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
import type { PostWithUser, Post } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_CAPTION_LENGTH = 2200;

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
        comments_count
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

    // 5-1. users 정보 별도 조회 (VIEW에는 외래 키가 없으므로 별도 조회 필요)
    const userIds = [...new Set(posts?.map((p) => p.user_id) || [])];
    let usersMap = new Map<string, { id: string; clerk_id: string; name: string; created_at: string }>();

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, clerk_id, name, created_at")
        .in("id", userIds);

      if (usersError) {
        console.error("❌ 사용자 정보 조회 실패:", usersError);
        // 에러가 발생해도 게시물은 반환하되, 사용자 정보는 기본값 사용
      } else {
        usersMap = new Map(users?.map((u) => [u.id, u]) || []);
        console.log(`✅ 사용자 정보 ${usersMap.size}개 조회됨`);
      }
    }

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
    const formattedPosts: PostWithUser[] = (posts || []).map((post) => {
      const user = usersMap.get(post.user_id);
      
      return {
        id: post.post_id,
        user_id: post.user_id,
        image_url: post.image_url,
        caption: post.caption,
        created_at: post.created_at,
        updated_at: post.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        user: user || {
          id: post.user_id,
          clerk_id: '',
          name: 'Unknown',
          created_at: post.created_at,
        },
        is_liked: likedPostIds.has(post.post_id),
      };
    });

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

/**
 * POST: 게시물 생성
 *
 * 요청 본문 (FormData):
 * - image: File (이미지 파일, 필수)
 * - caption: string (선택적, 최대 2,200자)
 *
 * 응답:
 * {
 *   success: true,
 *   post: Post
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("POST /api/posts");

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

    // 2. FormData 파싱
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const caption = formData.get("caption") as string | null;

    // 3. 파일 검증
    if (!image) {
      console.log("❌ 이미지 파일 없음");
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      console.log("❌ 파일 크기 초과:", image.size);
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(image.type)) {
      console.log("❌ 잘못된 파일 타입:", image.type);
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
        },
        { status: 400 }
      );
    }

    // 4. 캡션 검증
    const captionText = caption?.trim() || null;
    if (captionText && captionText.length > MAX_CAPTION_LENGTH) {
      console.log("❌ 캡션 길이 초과:", captionText.length);
      return NextResponse.json(
        { error: `Caption exceeds ${MAX_CAPTION_LENGTH} characters` },
        { status: 400 }
      );
    }

    console.log("📋 요청 데이터:", {
      fileName: image.name,
      fileSize: image.size,
      fileType: image.type,
      captionLength: captionText?.length || 0,
    });

    // 5. Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 6. 현재 사용자 UUID 조회
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

    // 7. Supabase Storage 업로드
    const fileExt = image.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    console.log("📤 파일 업로드 시작:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Storage 업로드 실패:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    console.log("✅ 파일 업로드 완료:", uploadData.path);

    // 8. Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;
    console.log("✅ Public URL:", imageUrl);

    // 9. posts 테이블에 저장
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: currentUser.id,
        image_url: imageUrl,
        caption: captionText,
      })
      .select()
      .single();

    if (postError) {
      console.error("❌ 게시물 저장 실패:", postError);

      // 업로드된 파일 삭제 시도 (롤백)
      await supabase.storage
        .from("posts")
        .remove([filePath])
        .catch(() => {}); // 삭제 실패는 무시

      return NextResponse.json(
        { error: "Failed to create post", details: postError.message },
        { status: 500 }
      );
    }

    console.log("✅ 게시물 생성 완료:", post.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("❌ POST /api/posts 에러:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

