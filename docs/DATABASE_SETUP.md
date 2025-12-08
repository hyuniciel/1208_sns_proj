# 데이터베이스 설정 가이드

이 문서는 Instagram Clone SNS 프로젝트의 Supabase 데이터베이스 설정 방법을 설명합니다.

## 마이그레이션 적용 방법

### 방법 1: Supabase Dashboard 사용 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **SQL Editor** 메뉴로 이동
4. **New query** 클릭
5. `supabase/migrations/20251208142032_initial_schema.sql` 파일 내용을 복사하여 붙여넣기
6. **Run** 클릭하여 실행
7. 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (로컬 개발)

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 적용
supabase db push

# 또는 특정 마이그레이션만 적용
supabase migration up
```

## 생성되는 테이블 확인

마이그레이션 적용 후 다음 테이블들이 생성되었는지 확인하세요:

### 1. users 테이블
- `id` (UUID, Primary Key)
- `clerk_id` (TEXT, Unique)
- `name` (TEXT)
- `created_at` (TIMESTAMP)

### 2. posts 테이블
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `image_url` (TEXT)
- `caption` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. likes 테이블
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- Unique constraint: (post_id, user_id)

### 4. comments 테이블
- `id` (UUID, Primary Key)
- `post_id` (UUID, Foreign Key → posts.id)
- `user_id` (UUID, Foreign Key → users.id)
- `content` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. follows 테이블
- `id` (UUID, Primary Key)
- `follower_id` (UUID, Foreign Key → users.id)
- `following_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- Unique constraint: (follower_id, following_id)
- Check constraint: follower_id != following_id

## Views 확인

### post_stats 뷰
게시물별 좋아요 수와 댓글 수를 포함하는 뷰입니다.

```sql
SELECT * FROM post_stats;
```

### user_stats 뷰
사용자별 게시물 수, 팔로워 수, 팔로잉 수를 포함하는 뷰입니다.

```sql
SELECT * FROM user_stats;
```

## Triggers 확인

### handle_updated_at() 함수
`posts`와 `comments` 테이블의 `updated_at` 컬럼을 자동으로 업데이트하는 트리거입니다.

확인 방법:
```sql
-- 함수 확인
SELECT * FROM pg_proc WHERE proname = 'handle_updated_at';

-- 트리거 확인
SELECT * FROM pg_trigger WHERE tgname = 'set_updated_at';
```

## Storage 버킷 설정

### 방법 1: SQL 마이그레이션 사용

`supabase/migrations/20251208142033_setup_storage.sql` 파일을 Supabase Dashboard의 SQL Editor에서 실행하세요.

### 방법 2: Supabase Dashboard 사용

1. Supabase Dashboard → **Storage** 메뉴
2. **New bucket** 클릭
3. 다음 정보 입력:
   - **Name**: `posts`
   - **Public bucket**: `true` (체크)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. **Create bucket** 클릭

### Storage 정책 설정

버킷 생성 후 RLS 정책을 설정해야 합니다. `20251208142033_setup_storage.sql` 파일에 포함되어 있거나, Storage → Policies에서 수동으로 설정할 수 있습니다.

## 문제 해결

### 마이그레이션 오류 발생 시

1. **테이블이 이미 존재하는 경우**
   - `CREATE TABLE IF NOT EXISTS` 구문을 사용했으므로 안전하게 재실행 가능
   - 기존 데이터는 유지됨

2. **권한 오류 발생 시**
   - Supabase Dashboard에서 Service Role Key로 실행
   - 또는 프로젝트 소유자 권한 확인

3. **트리거 오류 발생 시**
   - 함수가 먼저 생성되었는지 확인
   - `CREATE OR REPLACE FUNCTION` 구문 사용

### Storage 버킷 오류 발생 시

1. **버킷이 이미 존재하는 경우**
   - `ON CONFLICT` 구문으로 안전하게 업데이트됨
   - 기존 파일은 유지됨

2. **정책 오류 발생 시**
   - Storage → Policies에서 기존 정책 확인
   - 필요시 정책 삭제 후 재생성

## 다음 단계

마이그레이션 적용 완료 후:

1. 테이블 구조 확인 (Table Editor)
2. 샘플 데이터 삽입 테스트
3. Storage 버킷에 이미지 업로드 테스트
4. API 개발 시작

## 참고 파일

- `supabase/migrations/20251208142032_initial_schema.sql` - 데이터베이스 스키마
- `supabase/migrations/20251208142033_setup_storage.sql` - Storage 버킷 설정
- `lib/types.ts` - TypeScript 타입 정의

