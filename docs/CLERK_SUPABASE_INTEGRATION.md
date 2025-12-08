# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 방식으로 통합하는 방법을 설명합니다.

## 개요

2025년 4월부터 Clerk는 Supabase와의 네이티브 통합을 제공합니다. 이 방식은 이전의 JWT 템플릿 방식보다 더 간단하고 안전합니다.

### 주요 장점

- ✅ JWT 템플릿 불필요 (deprecated)
- ✅ Supabase JWT 시크릿 키를 Clerk와 공유할 필요 없음
- ✅ 각 요청마다 새 토큰을 가져올 필요 없음
- ✅ 자동 토큰 검증 및 갱신

## 설정 단계

### 1. Clerk Dashboard에서 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. **"Setup"** → **"Integrations"** → **"Supabase"** 또는 [직접 링크](https://dashboard.clerk.com/setup/supabase)
3. 통합 옵션 선택 후 **"Activate Supabase integration"** 클릭
4. 표시된 **"Clerk domain"** 복사 (예: `your-app-12.clerk.accounts.dev`)

### 2. Supabase Dashboard에서 Clerk 제공자 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)로 이동
2. 프로젝트 선택 → **Settings** → **Authentication** → **Providers**
3. **"Third-Party Auth"** 섹션에서 **"Add Provider"** 클릭
4. **"Clerk"** 선택
5. **"Clerk domain"** 필드에 1단계에서 복사한 값 입력
6. **"Save"** 클릭

## 코드 사용법

### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*');
      
      if (!error) {
        setTasks(data);
      }
    }

    loadTasks();
  }, [isLoaded, user, supabase]);

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Component에서 사용

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {tasks?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Server Action에서 사용

```ts
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function createTask(name: string) {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return data;
}
```

## Row Level Security (RLS) 정책

Clerk user ID는 JWT의 `sub` 클레임에 포함됩니다. RLS 정책에서 이를 사용하여 데이터 접근을 제한할 수 있습니다.

### 예제: Tasks 테이블 RLS 정책

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub'
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 작업만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책: 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- UPDATE 정책: 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- DELETE 정책: 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);
```

## 환경 변수

`.env.local` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 전용
```

## 문제 해결

### 인증 오류가 발생하는 경우

1. **Clerk domain이 올바르게 설정되었는지 확인**
   - Supabase Dashboard → Authentication → Providers에서 확인

2. **환경 변수가 올바르게 설정되었는지 확인**
   - `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서도 접근 가능해야 함

3. **RLS 정책 확인**
   - `auth.jwt()->>'sub'`가 올바르게 사용되고 있는지 확인
   - 개발 중에는 RLS를 비활성화하여 테스트할 수 있음

### 토큰이 전달되지 않는 경우

- Client Component에서는 `useSession()`과 `useUser()`가 로드되었는지 확인
- Server Component에서는 `auth()`가 올바르게 호출되는지 확인

## 참고 자료

- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

