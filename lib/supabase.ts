/**
 * @deprecated 이 파일은 레거시입니다. 새로운 통합 방식을 사용하세요:
 * - Server Component/Server Action: `lib/supabase/server.ts`의 `createClerkSupabaseClient()` 사용
 * - Client Component: `lib/supabase/clerk-client.ts`의 `useClerkSupabaseClient()` 사용
 * - Service Role (관리자): `lib/supabase/service-role.ts`의 `getServiceRoleClient()` 사용
 * - 공개 데이터: `lib/supabase/client.ts`의 `supabase` 사용
 *
 * 이 파일은 하위 호환성을 위해 유지되지만, 새 코드에서는 사용하지 마세요.
 */

import { createClerkSupabaseClient } from "./supabase/server";

/**
 * @deprecated Use `createClerkSupabaseClient()` from `lib/supabase/server` instead
 */
export const createSupabaseClient = createClerkSupabaseClient;
