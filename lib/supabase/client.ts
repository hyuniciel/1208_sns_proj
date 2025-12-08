import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase 브라우저 클라이언트 (공개 데이터용)
 *
 * 인증이 필요 없는 공개 데이터 접근에 사용합니다.
 * RLS 정책이 `to anon`인 데이터만 접근 가능합니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   useEffect(() => {
 *     async function loadPublicData() {
 *       const { data } = await supabase.from('public_posts').select('*');
 *       console.log(data);
 *     }
 *     loadPublicData();
 *   }, []);
 * }
 * ```
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
