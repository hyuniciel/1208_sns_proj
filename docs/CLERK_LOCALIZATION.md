# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 이 프로젝트는 한국어(`koKR`) 로컬라이제이션을 사용합니다.

## 현재 설정

프로젝트의 `app/layout.tsx`에서 한국어 로컬라이제이션이 이미 적용되어 있습니다:

```tsx
import { koKR } from "@/lib/clerk/localization";
import { ClerkProvider } from "@clerk/nextjs";

<ClerkProvider localization={koKR}>
  {/* ... */}
</ClerkProvider>
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

- 한국어: `koKR` (ko-KR)
- 영어: `enUS` (en-US), `enGB` (en-GB)
- 일본어: `jaJP` (ja-JP)
- 중국어: `zhCN` (zh-CN), `zhTW` (zh-TW)
- 기타 50개 이상의 언어

전체 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참조하세요.

## 사용 방법

### 기본 사용 (현재 설정)

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 커스텀 로컬라이제이션

특정 메시지를 커스터마이징하려면 `lib/clerk/localization.ts` 파일을 수정하세요:

```tsx
// lib/clerk/localization.ts
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    title: "커스텀 로그인 제목",
    subtitle: "계정에 로그인하세요",
  },
};
```

그리고 `app/layout.tsx`에서 사용:

```tsx
import { customKoKR } from "@/lib/clerk/localization";

<ClerkProvider localization={customKoKR}>
  {/* ... */}
</ClerkProvider>
```

### 에러 메시지 커스터마이징

에러 메시지를 커스터마이징하려면 `unstable__errors` 키를 사용합니다:

```tsx
// lib/clerk/localization.ts
export const koKRWithCustomErrors = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않았습니다. 기업 이메일 도메인을 허용 목록에 추가하려면 이메일을 보내주세요.",
  },
};
```

사용 가능한 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체를 참조하세요.

## 주의사항

### 실험적 기능

로컬라이제이션 기능은 현재 **실험적(experimental)** 단계입니다. 사용 중 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

### 호스팅 페이지

로컬라이제이션은 **Clerk 컴포넌트**에만 적용됩니다. Clerk 호스팅 페이지(Clerk Account Portal)는 여전히 영어로 표시됩니다.

### Tailwind CSS v4 호환성

Tailwind CSS v4를 사용하는 경우, `appearance` prop에 `cssLayerName: "clerk"`을 설정해야 합니다:

```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk",
  }}
>
  {/* ... */}
</ClerkProvider>
```

## 파일 구조

```
lib/clerk/
└── localization.ts    # 한국어 로컬라이제이션 설정

app/
└── layout.tsx         # ClerkProvider에 로컬라이제이션 적용
```

## 참고 자료

- [Clerk 로컬라이제이션 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts) (에러 키 참조용)

