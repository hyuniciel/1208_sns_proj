/**
 * Clerk 한국어 로컬라이제이션 설정
 *
 * 이 파일은 Clerk 컴포넌트의 한국어 번역을 관리합니다.
 * 기본 koKR 로컬라이제이션을 확장하여 커스텀 메시지를 추가할 수 있습니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

import { koKR as baseKoKR } from "@clerk/localizations";

/**
 * 기본 한국어 로컬라이제이션
 *
 * Clerk에서 제공하는 기본 한국어 번역입니다.
 * 대부분의 경우 이 기본 설정을 사용하면 됩니다.
 *
 * @example
 * ```tsx
 * import { koKR } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={koKR}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const koKR = baseKoKR;

/**
 * 커스텀 한국어 로컬라이제이션
 *
 * 기본 koKR 로컬라이제이션을 기반으로 하되,
 * 필요시 특정 메시지를 커스터마이징할 수 있습니다.
 *
 * @example
 * ```tsx
 * import { customKoKR } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={customKoKR}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const customKoKR = {
  ...baseKoKR,
  // 필요시 특정 메시지 커스터마이징
  // 예: signIn: {
  //   ...baseKoKR.signIn,
  //   title: "커스텀 로그인 제목",
  // },
};

/**
 * 에러 메시지 커스터마이징 예제
 *
 * Clerk의 기본 에러 메시지를 한국어로 커스터마이징할 수 있습니다.
 *
 * @example
 * ```tsx
 * import { koKRWithCustomErrors } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={koKRWithCustomErrors}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const koKRWithCustomErrors = {
  ...baseKoKR,
  unstable__errors: {
    ...baseKoKR.unstable__errors,
    // 예: 특정 에러 메시지 커스터마이징
    // not_allowed_access:
    //   "접근이 허용되지 않았습니다. 기업 이메일 도메인을 허용 목록에 추가하려면 이메일을 보내주세요.",
  },
};

