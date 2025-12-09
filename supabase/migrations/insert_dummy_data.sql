-- ============================================
-- 더미 데이터 삽입 스크립트
-- ============================================
-- 홈 피드에 표시될 게시물을 생성합니다.
-- Supabase SQL Editor에서 실행하세요.
-- ============================================

-- 1. 기존 사용자 확인
SELECT id, clerk_id, name FROM users LIMIT 5;

-- 2. 더미 사용자 생성 (기존 사용자가 없을 경우)
-- 주의: clerk_id는 실제 Clerk 사용자 ID가 아니므로 테스트용으로만 사용
INSERT INTO users (clerk_id, name)
VALUES 
  ('dummy_user_1', '더미 사용자 1'),
  ('dummy_user_2', '더미 사용자 2'),
  ('dummy_user_3', '더미 사용자 3')
ON CONFLICT (clerk_id) DO NOTHING;

-- 3. 사용자 ID 가져오기 및 더미 게시물 생성
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  existing_user_id UUID;
BEGIN
  -- 기존 사용자가 있는지 확인 (실제 로그인한 사용자 우선 사용)
  SELECT id INTO existing_user_id FROM users ORDER BY created_at ASC LIMIT 1;
  
  -- 더미 사용자 ID 가져오기
  SELECT id INTO user1_id FROM users WHERE clerk_id = 'dummy_user_1' LIMIT 1;
  SELECT id INTO user2_id FROM users WHERE clerk_id = 'dummy_user_2' LIMIT 1;
  SELECT id INTO user3_id FROM users WHERE clerk_id = 'dummy_user_3' LIMIT 1;
  
  -- 더미 사용자가 없으면 기존 사용자 사용
  IF user1_id IS NULL THEN
    user1_id := existing_user_id;
    user2_id := existing_user_id;
    user3_id := existing_user_id;
  END IF;
  
  -- 기존 사용자가 없으면 첫 번째 더미 사용자 사용
  IF existing_user_id IS NULL AND user1_id IS NULL THEN
    -- 더미 사용자 생성 후 ID 가져오기
    INSERT INTO users (clerk_id, name) VALUES ('dummy_user_1', '더미 사용자 1') RETURNING id INTO user1_id;
    user2_id := user1_id;
    user3_id := user1_id;
  END IF;
  
  -- 더미 게시물 생성 (Picsum Photos 사용 - 랜덤 이미지)
  INSERT INTO posts (user_id, image_url, caption, created_at)
  VALUES 
    -- 사용자 1의 게시물들
    (user1_id, 'https://picsum.photos/600/600?random=1', '첫 번째 더미 게시물입니다! #더미데이터 #테스트', now() - interval '2 days'),
    (user1_id, 'https://picsum.photos/600/600?random=2', '두 번째 더미 게시물입니다. 테스트용입니다.', now() - interval '1 day'),
    (user1_id, 'https://picsum.photos/600/600?random=3', '세 번째 더미 게시물입니다. #더미', now() - interval '12 hours'),
    
    -- 사용자 2의 게시물들
    (COALESCE(user2_id, user1_id), 'https://picsum.photos/600/600?random=4', '네 번째 더미 게시물입니다. #테스트', now() - interval '6 hours'),
    (COALESCE(user2_id, user1_id), 'https://picsum.photos/600/600?random=5', '다섯 번째 더미 게시물입니다.', now() - interval '3 hours'),
    
    -- 사용자 3의 게시물들
    (COALESCE(user3_id, user1_id), 'https://picsum.photos/600/600?random=6', '여섯 번째 더미 게시물입니다. #더미데이터', now() - interval '1 hour'),
    (COALESCE(user3_id, user1_id), 'https://picsum.photos/600/600?random=7', '일곱 번째 더미 게시물입니다!', now() - interval '30 minutes'),
    
    -- 추가 게시물들
    (user1_id, 'https://picsum.photos/600/600?random=8', '여덟 번째 더미 게시물입니다. #테스트데이터', now() - interval '15 minutes'),
    (COALESCE(user2_id, user1_id), 'https://picsum.photos/600/600?random=9', '아홉 번째 더미 게시물입니다.', now() - interval '5 minutes'),
    (user1_id, 'https://picsum.photos/600/600?random=10', '열 번째 더미 게시물입니다! #마지막', now())
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '더미 게시물 생성 완료!';
END $$;

-- 4. 생성된 게시물 확인
SELECT 
  p.id,
  u.name as user_name,
  p.caption,
  p.created_at,
  p.image_url
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. (선택사항) 더미 좋아요 추가
DO $$
DECLARE
  post_ids UUID[];
  user_ids UUID[];
BEGIN
  -- 게시물 ID 가져오기 (최신 5개)
  SELECT ARRAY_AGG(id) INTO post_ids 
  FROM posts 
  ORDER BY created_at DESC 
  LIMIT 5;
  
  -- 사용자 ID 가져오기
  SELECT ARRAY_AGG(id) INTO user_ids 
  FROM users 
  LIMIT 3;
  
  -- 좋아요 추가 (각 게시물에 랜덤하게 좋아요 추가)
  IF post_ids IS NOT NULL AND user_ids IS NOT NULL AND array_length(post_ids, 1) > 0 THEN
    -- 첫 번째 게시물에 여러 좋아요 추가
    INSERT INTO likes (post_id, user_id)
    SELECT 
      post_ids[1],
      unnest(user_ids)
    ON CONFLICT (post_id, user_id) DO NOTHING;
    
    -- 두 번째 게시물에 좋아요 추가
    IF array_length(post_ids, 1) > 1 THEN
      INSERT INTO likes (post_id, user_id)
      SELECT 
        post_ids[2],
        user_ids[1]
      ON CONFLICT (post_id, user_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE '더미 좋아요 추가 완료!';
  END IF;
END $$;

-- 6. (선택사항) 더미 댓글 추가
DO $$
DECLARE
  post_ids UUID[];
  user_ids UUID[];
BEGIN
  -- 게시물 ID 가져오기 (최신 3개)
  SELECT ARRAY_AGG(id) INTO post_ids 
  FROM posts 
  ORDER BY created_at DESC 
  LIMIT 3;
  
  -- 사용자 ID 가져오기
  SELECT ARRAY_AGG(id) INTO user_ids 
  FROM users 
  LIMIT 3;
  
  -- 댓글 추가
  IF post_ids IS NOT NULL AND user_ids IS NOT NULL AND array_length(post_ids, 1) > 0 THEN
    INSERT INTO comments (post_id, user_id, content)
    VALUES 
      (post_ids[1], user_ids[1], '정말 멋진 게시물이네요! 👍'),
      (post_ids[1], COALESCE(user_ids[2], user_ids[1]), '좋아요!'),
      (post_ids[2], user_ids[1], '인상적입니다.'),
      (COALESCE(post_ids[3], post_ids[1]), COALESCE(user_ids[3], user_ids[1]), '대단해요!')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '더미 댓글 추가 완료!';
  END IF;
END $$;

-- 7. 최종 확인: post_stats 뷰로 확인 (홈화면에서 보이는 것과 동일)
SELECT 
  ps.post_id,
  u.name as user_name,
  ps.caption,
  ps.likes_count,
  ps.comments_count,
  ps.created_at
FROM post_stats ps
JOIN users u ON ps.user_id = u.id
ORDER BY ps.created_at DESC
LIMIT 10;

