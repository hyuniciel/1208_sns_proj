---
name: post_stats VIEW users 관계 에러 수정
overview: post_stats VIEW에서 users 테이블과의 관계를 찾을 수 없는 에러를 수정합니다. VIEW에는 외래 키가 없으므로 users 정보를 별도 쿼리로 조회하여 병합합니다.
todos:
  - id: route-group
    content: app/(main)/layout.tsx 생성 및 기본 레이아웃 구조 작성 (Sidebar, Header, BottomNav 통합, 반응형 구조)
    status: completed
  - id: sidebar-component
    content: components/layout/Sidebar.tsx 생성 - Desktop 244px (아이콘+텍스트), Tablet 72px (아이콘만), Mobile 숨김, 메뉴 항목 및 Active 상태 관리
    status: completed
    dependencies:
      - route-group
  - id: header-component
    content: components/layout/Header.tsx 생성 - Mobile 전용 60px 높이, 로고 + 알림/DM/프로필 아이콘, Desktop/Tablet 숨김
    status: completed
    dependencies:
      - route-group
  - id: bottomnav-component
    content: components/layout/BottomNav.tsx 생성 - Mobile 전용 50px 높이, 5개 아이콘 (홈/검색/만들기/좋아요/프로필), Desktop/Tablet 숨김
    status: completed
    dependencies:
      - route-group
  - id: layout-integration
    content: app/(main)/layout.tsx에 모든 레이아웃 컴포넌트 통합 및 반응형 동작 확인
    status: completed
    dependencies:
      - sidebar-component
      - header-component
      - bottomnav-component
  - id: styling-refinement
    content: Instagram 디자인에 맞게 스타일 조정 (Hover 효과, Active 상태, 애니메이션)
    status: completed
    dependencies:
      - layout-integration
---

# post_stats VIEW users 관계 에러 수정 계획

## 문제 분석

**에러 메시지:**

```
Could not find a relationship between 'post_stats' and 'users' in the schema cache
```

**원인:**

- `post_stats`는 VIEW이므로 외래 키 관계가 없음
- Supabase의 자동 관계 탐지(`users!post_stats_user_id_fkey`)가 작동하지 않음
- 현재 코드에서 VIEW에서 직접 users 정보를 JOIN하려고 시도함

**에러 위치:**

- `app/api/posts/route.ts`: 80-96번 줄

## 해결 방법

`post_stats` VIEW에서 게시물 정보만 조회하고, users 정보는 별도 쿼리로 조회한 후 JavaScript에서 병합합니다.

## 수정할 파일

### `app/api/posts/route.ts`

**변경 사항:**

1. **post_stats 쿼리 수정** (80-96번 줄)

   - users 관계 제거
   - 게시물 정보만 조회

2. **users 정보 별도 조회 추가**

   - post_stats 조회 후 user_id 목록 추출
   - users 테이블에서 해당 user_id들 조회
   - Map으로 변환하여 빠른 조회 가능하도록 함

3. **데이터 병합 로직 수정** (145-162번 줄)

   - post_stats 결과와 users 정보를 병합
   - PostWithUser 타입에 맞게 변환

## 구현 세부사항

### 1. post_stats 쿼리 수정

```typescript
// 변경 전
let query = supabase
  .from("post_stats")
  .select(`
    post_id,
    user_id,
    image_url,
    caption,
    created_at,
    likes_count,
    comments_count,
    users!post_stats_user_id_fkey (
      id,
      clerk_id,
      name,
      created_at
    )
  `)

// 변경 후
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
```

### 2. users 정보 별도 조회 추가

post_stats 조회 후, user_id 목록을 추출하고 users 테이블에서 조회:

```typescript
// post_stats 조회 후
const postIds = posts?.map((p) => p.post_id) || [];
const userIds = [...new Set(posts?.map((p) => p.user_id) || [])];

// users 정보 조회
const { data: users, error: usersError } = await supabase
  .from("users")
  .select("id, clerk_id, name, created_at")
  .in("id", userIds);

if (usersError) {
  console.error("❌ 사용자 정보 조회 실패:", usersError);
  // 에러 처리
}

// Map으로 변환하여 빠른 조회
const usersMap = new Map(users?.map((u) => [u.id, u]) || []);
```

### 3. 데이터 병합 로직 수정

```typescript
const formattedPosts: PostWithUser[] = (posts || []).map((post) => {
  const user = usersMap.get(post.user_id);
  
  if (!user) {
    console.warn(`사용자 정보 없음: ${post.user_id}`);
    // 기본값 또는 에러 처리
  }

  return {
    id: post.post_id,
    user_id: post.user_id,
    image_url: post.image_url,
    caption: post.caption,
    created_at: post.created_at,
    updated_at: post.created_at,
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
```

## 예상 결과

- post_stats VIEW에서 게시물 정보만 조회
- users 정보는 별도 쿼리로 조회하여 병합
- 외래 키 관계 에러 해결
- 기능은 동일하게 작동

## 성능 고려사항

- users 조회는 IN 쿼리로 한 번에 처리 (배치 처리)
- Map을 사용하여 O(1) 조회 시간 보장
- 추가 쿼리 1개 발생하지만, VIEW의 JOIN 제한을 우회하는 유일한 방법