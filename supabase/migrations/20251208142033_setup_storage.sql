-- ============================================
-- Storage 버킷 생성 및 정책 설정
-- ============================================
-- Instagram Clone SNS 프로젝트용 posts 버킷
-- 게시물 이미지 저장용
-- ============================================

-- posts 버킷 생성 (공개 읽기)
-- 이미 존재하면 무시됨
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- 공개 버킷 (모든 사용자가 읽기 가능)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024) - PRD 기준
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================
-- RLS 정책 설정 (개발 단계에서는 비활성화 가능)
-- ============================================

-- INSERT: 인증된 사용자만 자신의 폴더에 업로드 가능
-- 경로 구조: {clerk_user_id}/{filename}
CREATE POLICY "Users can upload posts to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- SELECT: 공개 읽기 (public bucket이므로 모든 사용자 조회 가능)
CREATE POLICY "Anyone can view posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- DELETE: 인증된 사용자만 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- UPDATE: 인증된 사용자만 자신의 파일 업데이트 가능
CREATE POLICY "Users can update own posts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

