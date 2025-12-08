# Supabase 통합 가이드

이 문서는 Supabase 공식 Next.js 가이드 패턴을 따르면서 Clerk 통합도 지원하는 방법을 설명합니다.

## 개요

이 프로젝트는 Supabase 공식 Next.js 가이드의 모범 사례를 따르면서, Clerk 인증과의 통합도 지원합니다.

### 두 가지 인증 방식 지원

1. **Supabase 자체 인증** (Cookie-based)
   - `createClient()` 함수 사용
   - Supabase 공식 패턴
   - `@supabase/ssr` 패키지 사용

2. **Clerk 인증** (Third-party)
   - `createClerkSupabaseClient()` 함수 사용
   - Clerk 토큰 기반 인증
   - `@supabase/supabase-js` 직접 사용

## 설치된 패키지

```json
{
  "@supabase/supabase-js": "^2.49.8",
  "@supabase/ssr": "^0.8.0"
}
```

## 사용 방법

### 1. Supabase 자체 인증 사용 (Server Component)

Supabase 공식 패턴을 따릅니다:

```tsx
// app/instruments/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();
  
  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
```

### 2. Clerk 인증 사용 (Server Component)

Clerk 토큰을 사용하여 인증합니다:

```tsx
// app/tasks/page.tsx
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export default async function TasksPage() {
  const supabase = createClerkSupabaseClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*");

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

### 3. Clerk 인증 사용 (Client Component)

```tsx
'use client';

import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function TasksClient() {
  const supabase = useClerkSupabaseClient();
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*");
      
      if (!error && data) {
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

### 4. 공개 데이터 접근 (인증 불필요)

```tsx
'use client';

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function PublicPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from("public_posts")
        .select("*");
      
      if (data) {
        setPosts(data);
      }
    }

    loadPosts();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## 파일 구조

```
lib/supabase/
├── server.ts          # Server Component용 (Supabase 공식 패턴 + Clerk 통합)
├── clerk-client.ts    # Client Component용 (Clerk 통합)
├── client.ts          # 공개 데이터용 (브라우저 클라이언트)
└── service-role.ts    # 관리자 권한용 (RLS 우회)
```

## 환경 변수

`.env.local` 파일에 다음 변수들이 필요합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 전용

# Clerk (Clerk 통합 사용 시)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 함수별 사용 가이드

### `createClient()` - Supabase 공식 패턴

- **용도**: Supabase 자체 인증 사용 시
- **위치**: Server Component, Route Handler
- **특징**: Cookie-based auth, 자동 세션 관리
- **패키지**: `@supabase/ssr`

```tsx
const supabase = await createClient();
```

### `createClerkSupabaseClient()` - Clerk 통합

- **용도**: Clerk 인증 사용 시
- **위치**: Server Component, Route Handler
- **특징**: Clerk 토큰 기반 인증
- **패키지**: `@supabase/supabase-js`

```tsx
const supabase = createClerkSupabaseClient();
```

### `useClerkSupabaseClient()` - Clerk 통합 (Client)

- **용도**: Clerk 인증 사용 시 (Client Component)
- **위치**: Client Component만
- **특징**: React Hook, 자동 토큰 갱신
- **패키지**: `@supabase/supabase-js`

```tsx
const supabase = useClerkSupabaseClient();
```

### `supabase` - 공개 데이터

- **용도**: 인증 불필요한 공개 데이터
- **위치**: Client Component
- **특징**: anon key만 사용, RLS `to anon` 정책 필요
- **패키지**: `@supabase/ssr`

```tsx
import { supabase } from "@/lib/supabase/client";
```

## 참고 자료

- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase SSR Documentation](https://supabase.com/docs/reference/javascript/ssr)
- [Clerk + Supabase Integration](./CLERK_SUPABASE_INTEGRATION.md)

