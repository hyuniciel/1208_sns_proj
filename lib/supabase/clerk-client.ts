"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession, useUser } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 네이티브 통합 방식 (권장):
 * - JWT 템플릿 불필요 (deprecated as of April 2025)
 * - Clerk 세션 토큰을 Supabase가 자동 검증
 * - useSession().getToken()으로 현재 세션 토큰 사용
 * - useUser()로 사용자 로딩 상태 확인
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *   const { user } = useUser();
 *
 *   useEffect(() => {
 *     if (!user) return;
 *
 *     async function loadData() {
 *       const { data } = await supabase.from('table').select('*');
 *       console.log(data);
 *     }
 *
 *     loadData();
 *   }, [user, supabase]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { session } = useSession();
  const { isLoaded } = useUser();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // useSession()이 로드되기 전에는 null 반환
        if (!isLoaded || !session) {
          return null;
        }
        return (await session.getToken()) ?? null;
      },
    });
  }, [session, isLoaded]);

  return supabase;
}
