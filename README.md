<div align="center">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.JS_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" />
    <img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logoColor=white&logo=clerk" alt="clerk" />
    <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  </div>

  <h1 align="center">Mini Instagram</h1>
  <h3 align="center">Instagram UI 기반 SNS 애플리케이션</h3>

  <p align="center">
    Next.js 15 + Clerk + Supabase로 구현한 Instagram 스타일 SNS 프로젝트
  </p>
</div>

## 📋 목차

1. [소개](#소개)
2. [기술 스택](#기술-스택)
3. [주요 기능](#주요-기능)
4. [시작하기](#시작하기)
5. [추가 설정 및 팁](#추가-설정-및-팁)
6. [프로젝트 구조](#프로젝트-구조)

## 소개

Instagram 웹 UI/UX를 재현한 SNS 애플리케이션입니다. Next.js 15, Clerk, Supabase를 활용하여 구현했습니다.

**핵심 특징:**
- ✨ Next.js 15 + React 19 최신 기능 활용
- 🔐 Clerk와 Supabase 네이티브 통합 (2025년 권장 방식)
- 🎨 Tailwind CSS v4 + shadcn/ui
- 📱 완전한 반응형 디자인 (Mobile/Tablet/Desktop)
- 🌐 한국어 지원 (Clerk 한국어 로컬라이제이션)
- 📸 게시물 작성, 좋아요, 댓글, 팔로우 기능
- 🎭 Instagram 스타일 UI/UX

## 기술 스택

### 프레임워크 & 라이브러리

- **[Next.js 15](https://nextjs.org/)** - React 프레임워크 (App Router, Server Components)
- **[React 19](https://react.dev/)** - UI 라이브러리
- **[TypeScript](https://www.typescriptlang.org/)** - 타입 안정성

### 인증 & 데이터베이스

- **[Clerk](https://clerk.com/)** - 사용자 인증 및 관리
  - Google, 이메일 등 다양한 로그인 방식 지원
  - 한국어 UI 지원
  - Supabase와 네이티브 통합
- **[Supabase](https://supabase.com/)** - PostgreSQL 데이터베이스
  - 실시간 데이터 동기화
  - Row Level Security (RLS)
  - 파일 스토리지

### UI & 스타일링

- **[Tailwind CSS v4](https://tailwindcss.com/)** - 유틸리티 우선 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리
- **[Radix UI](https://www.radix-ui.com/)** - 접근성 높은 헤드리스 컴포넌트
- **[lucide-react](https://lucide.dev/)** - 아이콘 라이브러리

### 폼 & 검증

- **[React Hook Form](https://react-hook-form.com/)** - 폼 상태 관리
- **[Zod](https://zod.dev/)** - 스키마 검증

## 주요 기능

### 📸 게시물 기능
- 게시물 작성 (이미지 업로드 + 캡션)
- 게시물 피드 (무한 스크롤)
- 게시물 상세 보기 (모달/페이지)
- 게시물 삭제 (본인만)

### ❤️ 좋아요 기능
- 좋아요/좋아요 취소
- 더블탭 좋아요 (모바일)
- 좋아요 애니메이션

### 💬 댓글 기능
- 댓글 작성/삭제
- 댓글 목록 표시
- 댓글 실시간 업데이트

### 👤 프로필 기능
- 사용자 프로필 페이지
- 게시물 그리드 (3열)
- 통계 표시 (게시물 수, 팔로워, 팔로잉)

### 🔗 팔로우 기능
- 팔로우/언팔로우
- 팔로워/팔로잉 수 실시간 업데이트

### 🔐 인증 시스템
- Clerk를 통한 안전한 사용자 인증
- 소셜 로그인 지원 (Google 등)
- Clerk 사용자 자동으로 Supabase DB에 동기화
- 한국어 UI 지원 (Clerk 컴포넌트 완전 한국어화)

### 🎨 UI/UX
- Instagram 스타일 디자인
- 완전한 반응형 디자인 (Mobile/Tablet/Desktop)
- 접근성 준수 (WCAG 2.1 AA)
- 키보드 네비게이션 지원
- ARIA 레이블 및 시맨틱 HTML

## 시작하기

### 필수 요구사항

시스템에 다음이 설치되어 있어야 합니다:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18 이상)
- [pnpm](https://pnpm.io/) (권장 패키지 매니저)

```bash
# pnpm 설치
npm install -g pnpm
```

### 프로젝트 초기화

다음 단계를 순서대로 진행하세요:

#### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속하여 로그인
2. **"New Project"** 클릭
3. Organization 선택 (없으면 새로 생성)
4. 프로젝트 정보 입력:
   - **Name**: 원하는 프로젝트 이름
   - **Database Password**: 안전한 비밀번호 생성 (기억할 필요 없음, Supabase가 관리)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서비스용)
   - **Pricing Plan**: Free 또는 Pro 선택
5. **"Create new project"** 클릭하고 프로젝트가 준비될 때까지 대기 (~2분)

#### 2. Clerk 프로젝트 생성

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속하여 로그인
2. **"Create application"** 클릭
3. 애플리케이션 정보 입력:
   - **Application name**: 원하는 이름 (예: `SaaS Template`)
   - **Sign-in options**: Email, Google 등 원하는 인증 방식 선택
4. **"Create application"** 클릭
5. Quick Start 화면에서 **"Continue in Dashboard"** 클릭

#### 3. Clerk + Supabase 네이티브 통합 설정

> **중요**: 2025년 4월부터 Clerk의 네이티브 Supabase 통합을 사용합니다. JWT Template은 deprecated되었으며 더 이상 필요하지 않습니다.

**3-1. Clerk Dashboard에서 Supabase 통합 활성화**

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인
2. **"Setup"** 또는 **"Integrations"** 메뉴로 이동
3. **"Supabase"** 통합 찾기 또는 [직접 링크](https://dashboard.clerk.com/setup/supabase)로 이동
4. 통합 옵션 선택 후 **"Activate Supabase integration"** 클릭
5. **"Clerk domain"** 값이 표시됩니다 (예: `your-app-12.clerk.accounts.dev`)
   - 이 값을 복사해두세요 (다음 단계에서 사용)

**3-2. Supabase Dashboard에서 Clerk를 서드파티 인증 제공자로 추가**

1. [Supabase Dashboard](https://supabase.com/dashboard)로 이동
2. 프로젝트 선택 → **Settings** → **Authentication** → **Providers**
3. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기
4. **"Add Provider"** 클릭하고 **"Clerk"** 선택
5. **"Clerk domain"** 필드에 3-1에서 복사한 Clerk domain 입력
   - 예: `your-app-12.clerk.accounts.dev`
6. **"Save"** 또는 **"Add Provider"** 클릭

**3-3. 통합 확인**

- Clerk 세션 토큰이 자동으로 Supabase 인증에 사용됩니다
- JWT 템플릿이나 추가 설정 없이 바로 사용 가능합니다
- [Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)에서 추가 정보 확인 가능

#### 4. Supabase Storage 생성 및 설정

1. Supabase Dashboard → **Storage** 메뉴
2. **"New bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `posts` (`.env.example`과 동일하게)
   - **Public bucket**: Public 선택 (게시물 이미지는 공개)
4. **"Create bucket"** 클릭

#### 5. 데이터베이스 스키마 적용

1. Supabase Dashboard → **SQL Editor** 메뉴
2. **"New query"** 클릭
3. `supabase/migrations/db.sql` 파일 내용을 복사하여 붙여넣기
4. **"Run"** 클릭하여 실행
5. 성공 메시지 확인 (`Success. No rows returned`)

**생성되는 테이블:**
- `users`: Clerk 사용자와 동기화되는 사용자 정보 테이블
- `posts`: 게시물 테이블
- `likes`: 좋아요 테이블
- `comments`: 댓글 테이블
- `follows`: 팔로우 테이블

**생성되는 뷰:**
- `post_stats`: 게시물 통계 (좋아요 수, 댓글 수)
- `user_stats`: 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수)

#### 6. 환경 변수 설정

**6-1. 저장소 클론 및 의존성 설치**

```bash
git clone <your-repository-url>
cd saas-template
pnpm install
```

**6-2. .env 파일 생성**

```bash
cp .env.example .env
```

**6-3. Supabase 환경 변수 설정**

1. Supabase Dashboard → **Settings** → **API**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="<Project URL>"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon public key>"
   SUPABASE_SERVICE_ROLE_KEY="<service_role secret key>"
   NEXT_PUBLIC_STORAGE_BUCKET="posts"
   ```

> **⚠️ 주의**: `service_role` 키는 모든 RLS를 우회하는 관리자 권한이므로 절대 공개하지 마세요!

**6-4. Clerk 환경 변수 설정**

1. Clerk Dashboard → **API Keys**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<Publishable Key>"
   CLERK_SECRET_KEY="<Secret Key>"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
   ```

#### 7. Cursor MCP 설정 (선택사항)

> Cursor AI를 사용하는 경우, Supabase MCP 서버를 설정하면 AI가 데이터베이스를 직접 조회하고 관리할 수 있습니다.

**7-1. Supabase Access Token 생성**

1. Supabase Dashboard → 우측 상단 프로필 아이콘 클릭
2. **Account Settings** → **Access Tokens**
3. **"Generate new token"** 클릭
4. Token name 입력 (예: `cursor-mcp`)
5. 생성된 토큰 복사 (다시 볼 수 없으므로 안전한 곳에 보관)

**7-2. .cursor/mcp.json 설정**

`.cursor/mcp.json` 파일을 열고 `your_supabase_access_token` 부분을 실제 토큰으로 교체:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      ]
    }
  }
}
```

**7-3. Cursor 재시작**

Cursor를 완전히 종료하고 다시 실행하여 MCP 서버 설정을 적용합니다.

#### 8. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

**주요 페이지:**
- `/`: 홈 피드 (게시물 목록)
- `/profile`: 내 프로필
- `/profile/[userId]`: 다른 사용자 프로필

### 개발 명령어

```bash
# 개발 서버 실행 (Turbopack)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint
```

## 추가 설정 및 팁

### Clerk 한국어 설정

프로젝트에 이미 Clerk 한국어 로컬라이제이션이 적용되어 있습니다. `app/layout.tsx`의 `ClerkProvider`에서 `koKR` locale이 설정되어 있습니다.

### Supabase RLS (Row Level Security) 정책

프로젝트의 `users` 테이블에는 기본 RLS 정책이 설정되어 있습니다:

- **SELECT**: 사용자는 자신의 데이터만 조회 가능
- **INSERT**: 새 사용자 생성 가능
- **UPDATE**: 사용자는 자신의 데이터만 수정 가능

추가 테이블 생성 시 RLS 정책을 반드시 설정하세요:

```sql
-- 테이블 생성
CREATE TABLE your_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(clerk_id),
  -- 기타 컬럼들
);

-- RLS 활성화
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- SELECT 정책
CREATE POLICY "Users can view their own data"
  ON your_table FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

-- INSERT 정책
CREATE POLICY "Users can insert their own data"
  ON your_table FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);
```

### 추가 로그인 방식 설정

Clerk에서 추가 로그인 방식을 활성화하려면:

1. Clerk Dashboard → **User & Authentication** → **Social Connections**
2. 원하는 제공자 선택 (Google, GitHub, Discord 등)
3. OAuth 자격 증명 입력 (제공자 개발자 콘솔에서 생성)
4. **Enable** 클릭

## 프로젝트 구조

```
1208_sns_proj/
├── app/                    # Next.js App Router
│   ├── (main)/            # 메인 레이아웃 그룹
│   │   ├── layout.tsx    # Sidebar + 레이아웃
│   │   ├── page.tsx      # 홈 피드
│   │   └── profile/      # 프로필 페이지
│   ├── api/               # API Routes
│   │   ├── posts/         # 게시물 API
│   │   ├── likes/         # 좋아요 API
│   │   ├── comments/      # 댓글 API
│   │   ├── follows/       # 팔로우 API
│   │   └── sync-user/    # Clerk → Supabase 사용자 동기화
│   ├── layout.tsx        # Root Layout (Clerk Provider)
│   └── globals.css       # 전역 스타일 (Tailwind v4 설정)
│
├── components/            # React 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx   # 사이드바
│   │   ├── Header.tsx    # 모바일 헤더
│   │   └── BottomNav.tsx # 하단 네비게이션
│   ├── post/             # 게시물 관련 컴포넌트
│   │   ├── PostCard.tsx  # 게시물 카드
│   │   ├── PostFeed.tsx  # 게시물 피드
│   │   ├── PostModal.tsx # 게시물 상세 모달
│   │   └── CreatePostModal.tsx # 게시물 작성 모달
│   ├── comment/          # 댓글 관련 컴포넌트
│   │   ├── CommentList.tsx
│   │   └── CommentForm.tsx
│   ├── profile/          # 프로필 관련 컴포넌트
│   │   ├── ProfileHeader.tsx
│   │   └── PostGrid.tsx
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── providers/        # Context Providers
│       └── sync-user-provider.tsx
│
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트들
│   │   ├── clerk-client.ts    # Client Component용
│   │   ├── server.ts          # Server Component용
│   │   ├── service-role.ts    # 관리자용
│   │   └── client.ts          # 공개 데이터용
│   └── types.ts          # TypeScript 타입 정의
│
├── hooks/                 # Custom React Hooks
│   └── use-sync-user.ts  # 사용자 동기화 훅
│
├── supabase/             # Supabase 관련 파일
│   ├── migrations/       # 데이터베이스 마이그레이션
│   │   └── db.sql       # 데이터베이스 스키마
│   └── config.toml       # Supabase 프로젝트 설정
│
├── docs/                 # 문서
│   ├── PRD.md           # 제품 요구사항 문서
│   └── TODO.md          # 개발 TODO 리스트
│
├── middleware.ts         # Next.js 미들웨어 (Clerk)
├── .env.example         # 환경 변수 예시
└── AGENTS.md            # AI 에이전트용 프로젝트 가이드
```

### 주요 파일 설명

- **`middleware.ts`**: Clerk 인증 미들웨어 설정
- **`app/layout.tsx`**: ClerkProvider와 SyncUserProvider 설정
- **`lib/supabase/`**: 환경별 Supabase 클라이언트 (매우 중요!)
- **`hooks/use-sync-user.ts`**: Clerk 사용자를 Supabase에 자동 동기화
- **`components/providers/sync-user-provider.tsx`**: 앱 전역에서 사용자 동기화 실행
- **`CLAUDE.md`**: Claude Code를 위한 프로젝트 가이드

## 추가 리소스

- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
