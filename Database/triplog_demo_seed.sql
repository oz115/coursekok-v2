-- CourseKok TripLog demo seed data
-- Usage: mysql -u {user} -p travel_db < Database/triplog_demo_seed.sql
--
-- Assumption:
--   - Database/migration_v2.sql has been applied, or the backend has run once with
--     spring.jpa.hibernate.ddl-auto=update so cover_image, mood, place_title,
--     place_category, place_image and rating columns exist.
--   - Demo accounts use the password "password" if you need to sign in.

USE travel_db;
SET NAMES utf8mb4;

START TRANSACTION;

-- Demo travelers
INSERT INTO users (email, password, nickname, role, profile_image, created_at, updated_at)
VALUES
  ('demo.hana@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '바다한나', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=hana', NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY),
  ('demo.jun@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '느린준', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=jun', NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 16 DAY),
  ('demo.soyeon@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '소소연', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=soyeon', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY),
  ('demo.minji@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '빛나는민지', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=minji', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),
  ('demo.doyun@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '도윤투어', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=doyun', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
  ('demo.yuri@coursekok.test', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiQ6.Fm1l4e8a33NQUFGK2QLf.qGqg.', '유리산책', 'USER', 'https://api.dicebear.com/8.x/adventurer/svg?seed=yuri', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY)
ON DUPLICATE KEY UPDATE
  nickname = VALUES(nickname),
  profile_image = VALUES(profile_image),
  updated_at = NOW();

-- Public TripLogs
INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '제주 동쪽에서 만난 가장 맑은 2박 3일',
       '성산일출봉에서 해가 올라오는 순간부터 여행이 환해졌어요. 사려니숲길은 천천히 걸을수록 공기가 더 선명하게 느껴졌고, 해 질 무렵 바다까지 이어지는 길이 참 좋았습니다. 일정이 빡빡하지 않아서 사진도 많이 남기고, 동행과 오래 이야기할 수 있었던 여행이었어요.',
       '제주', '자연·힐링', true, 186, 43, 18,
       '/images/img_jejueast.jpg', '상쾌한 아침',
       NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY
FROM users u
WHERE u.email = 'demo.hana@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '제주 동쪽에서 만난 가장 맑은 2박 3일');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '강릉 커피향 따라 걷는 파란 바다 하루',
       '안목해변에서 커피 한 잔을 들고 시작한 하루가 생각보다 훨씬 근사했어요. 경포호 주변은 햇빛이 부드럽고 길이 평탄해서 걷기 좋았고, 바다색이 밝아서 사진이 전부 엽서처럼 나왔습니다. 당일치기인데도 마음은 멀리 다녀온 느낌이었어요.',
       '강릉', '카페·바다', true, 143, 32, 11,
       '/images/img_gangneung.jpg', '포근한 바다',
       NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY
FROM users u
WHERE u.email = 'demo.jun@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '강릉 커피향 따라 걷는 파란 바다 하루');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '부산 바다와 시장을 오간 맛있는 주말',
       '흰여울문화마을에서 반짝이는 바다를 보고, 저녁에는 시장 골목을 천천히 돌았습니다. 회, 밀면, 씨앗호떡까지 실패 없는 메뉴들이 이어져서 여행 내내 기분이 좋았어요. 이동 동선이 짧아 주말 여행으로 정말 추천하고 싶습니다.',
       '부산', '미식·도시', true, 211, 58, 24,
       '/images/img_busanfood.jpg', '활기찬 주말',
       NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY
FROM users u
WHERE u.email = 'demo.soyeon@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '부산 바다와 시장을 오간 맛있는 주말');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '협재의 투명한 물빛과 노을 산책',
       '협재해수욕장은 낮에도 예쁘지만 해가 기울 때 더 빛났습니다. 카페에서 쉬다가 해변을 따라 걷는 코스가 여유로웠고, 사진마다 하늘색이 깨끗하게 담겼어요. 복잡한 일정 없이 한 장소를 충분히 즐기는 여행의 장점을 다시 느꼈습니다.',
       '제주', '해변·여유', true, 167, 37, 16,
       '/images/img_hyeopjae.jpg', '맑고 느긋한',
       NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY
FROM users u
WHERE u.email = 'demo.minji@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '협재의 투명한 물빛과 노을 산책');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '동백꽃 사이로 걸은 제주 오후',
       '동백 정원은 기대보다 훨씬 화사했습니다. 길마다 색이 선명해서 어디서 찍어도 밝은 사진이 나왔고, 근처 작은 식당에서 먹은 따뜻한 국수까지 완벽했어요. 가족과 함께 가도 좋고, 혼자 조용히 걸어도 충분히 좋은 코스였습니다.',
       '제주', '꽃길·가족', true, 122, 29, 9,
       '/images/img_camellia.jpg', '화사한 오후',
       NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY
FROM users u
WHERE u.email = 'demo.doyun@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '동백꽃 사이로 걸은 제주 오후');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '숲길과 로컬 식당으로 채운 제주 힐링 코스',
       '사려니숲길을 천천히 걷고 로컬 식당에서 점심을 먹은 뒤, 조용한 카페에서 쉬었습니다. 큰 관광지만 도는 여행보다 몸이 덜 피곤했고, 제주 특유의 초록빛을 오래 볼 수 있어 좋았어요. 다음에도 같은 코스를 한 번 더 걷고 싶습니다.',
       '제주', '숲·로컬', true, 154, 41, 20,
       '/images/img_saryeoni.jpg', '초록 쉼표',
       NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY
FROM users u
WHERE u.email = 'demo.yuri@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '숲길과 로컬 식당으로 채운 제주 힐링 코스');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '제주 해녀 이야기와 바다 밥상',
       '구좌 쪽 바다는 맑고 조용해서 오래 머물기 좋았습니다. 해녀 문화가 담긴 공간을 둘러보고, 신선한 해산물로 점심을 먹으니 여행지가 더 가까워진 느낌이었어요. 바다를 보는 시간과 맛있는 식사가 균형 있게 들어간 만족스러운 하루였습니다.',
       '제주', '문화·미식', true, 98, 25, 7,
       '/images/img_haenyeo.jpg', '따뜻한 로컬',
       NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY
FROM users u
WHERE u.email = 'demo.hana@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '제주 해녀 이야기와 바다 밥상');

INSERT INTO trip_logs (user_id, trip_id, title, content, region, travel_style, is_public, view_count, like_count, copy_count, cover_image, mood, created_at, updated_at)
SELECT u.id, NULL,
       '성산에서 시작해 고기국수로 마무리한 제주',
       '아침 성산일출봉은 조금 이른 시간이었지만 그만큼 한적하고 깨끗했습니다. 내려와서 먹은 고기국수는 따뜻했고, 오후에는 바다 근처 카페에서 쉬며 사진을 정리했어요. 짧은 일정이어도 제주다운 장면을 충분히 담을 수 있는 코스였습니다.',
       '제주', '사진·맛집', true, 133, 34, 13,
       '/images/img_seongsan.jpg', '든든한 하루',
       NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY
FROM users u
WHERE u.email = 'demo.jun@coursekok.test'
  AND NOT EXISTS (SELECT 1 FROM trip_logs WHERE title = '성산에서 시작해 고기국수로 마무리한 제주');

-- Place-level memories and photos
INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '일출 시간보다 조금 일찍 올라가니 하늘 색이 천천히 바뀌는 장면을 여유롭게 볼 수 있었어요.',
       '/images/img_seongsan.jpg', '성산일출봉', '관광지', '/images/img_seongsan.jpg', 5.0
FROM trip_logs tl
WHERE tl.title = '제주 동쪽에서 만난 가장 맑은 2박 3일'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 2,
       '숲길은 그늘이 많고 길이 부드러워 오래 걸어도 편했습니다. 사진보다 실제 초록빛이 더 깊어요.',
       '/images/img_saryeoni.jpg', '사려니숲길', '관광지', '/images/img_saryeoni.jpg', 4.8
FROM trip_logs tl
WHERE tl.title = '제주 동쪽에서 만난 가장 맑은 2박 3일'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 3, 3,
       '마지막 날은 해변을 천천히 걸으며 마무리했습니다. 물빛이 맑아 사진이 전부 밝게 나왔어요.',
       '/images/img_hyeopjae.jpg', '협재해수욕장', '관광지', '/images/img_hyeopjae.jpg', 4.9
FROM trip_logs tl
WHERE tl.title = '제주 동쪽에서 만난 가장 맑은 2박 3일'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 3);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '커피를 들고 바다를 보는 시간이 이번 여행의 하이라이트였습니다. 햇빛이 좋아 사진도 선명했어요.',
       '/images/img_gangneung.jpg', '안목해변 커피거리', '카페·해변', '/images/img_gangneung.jpg', 4.7
FROM trip_logs tl
WHERE tl.title = '강릉 커피향 따라 걷는 파란 바다 하루'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '호수 주변 산책로가 평탄해서 부담 없이 걸었습니다. 바다와 다른 조용한 분위기가 좋았어요.',
       '/images/img_gangneung.jpg', '경포호 산책로', '산책', '/images/img_gangneung.jpg', 4.6
FROM trip_logs tl
WHERE tl.title = '강릉 커피향 따라 걷는 파란 바다 하루'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '골목 사이로 보이는 바다가 예뻐서 잠깐 멈출 때마다 사진을 찍게 됐습니다.',
       '/images/img_busanfood.jpg', '흰여울문화마을', '관광지', '/images/img_busanfood.jpg', 4.8
FROM trip_logs tl
WHERE tl.title = '부산 바다와 시장을 오간 맛있는 주말'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '저녁 시장은 활기가 넘쳤고, 간식부터 식사까지 한 번에 해결할 수 있어 여행 분위기가 살아났어요.',
       '/images/img_busanfood.jpg', '부산 로컬 시장', '맛집', '/images/img_busanfood.jpg', 4.9
FROM trip_logs tl
WHERE tl.title = '부산 바다와 시장을 오간 맛있는 주말'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '물이 투명해서 발만 담가도 기분이 좋아졌습니다. 해 질 무렵 색감이 특히 예뻤어요.',
       '/images/img_hyeopjae.jpg', '협재해수욕장', '해변', '/images/img_hyeopjae.jpg', 5.0
FROM trip_logs tl
WHERE tl.title = '협재의 투명한 물빛과 노을 산책'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '바다를 보며 쉬기 좋은 카페였습니다. 창가 자리에서 보는 하늘이 오래 기억에 남아요.',
       '/images/img_cafejeju.jpg', '협재 바다 카페', '카페', '/images/img_cafejeju.jpg', 4.7
FROM trip_logs tl
WHERE tl.title = '협재의 투명한 물빛과 노을 산책'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '동백꽃 색이 선명해서 사진 찍는 재미가 있었습니다. 길도 잘 정돈되어 가족 여행에 좋아요.',
       '/images/img_camellia.jpg', '카멜리아 힐', '꽃길', '/images/img_camellia.jpg', 4.8
FROM trip_logs tl
WHERE tl.title = '동백꽃 사이로 걸은 제주 오후'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '따뜻한 국물과 깔끔한 고명이 좋아 산책 뒤 점심으로 딱이었습니다.',
       '/images/img_noodle.jpg', '제주 고기국수집', '맛집', '/images/img_noodle.jpg', 4.6
FROM trip_logs tl
WHERE tl.title = '동백꽃 사이로 걸은 제주 오후'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '나무 사이로 들어오는 빛이 예뻤습니다. 조용히 걷고 싶은 날에 가장 먼저 떠오를 곳이에요.',
       '/images/img_saryeoni.jpg', '사려니숲길', '숲길', '/images/img_saryeoni.jpg', 5.0
FROM trip_logs tl
WHERE tl.title = '숲길과 로컬 식당으로 채운 제주 힐링 코스'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '로컬 재료로 만든 점심이 담백해서 여행 중에도 속이 편했습니다.',
       '/images/img_blackpork.jpg', '제주 로컬 식당', '맛집', '/images/img_blackpork.jpg', 4.7
FROM trip_logs tl
WHERE tl.title = '숲길과 로컬 식당으로 채운 제주 힐링 코스'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '바다와 해녀 이야기를 함께 볼 수 있어 여행이 더 풍성해졌습니다.',
       '/images/img_haenyeo.jpg', '해녀 문화 공간', '문화', '/images/img_haenyeo.jpg', 4.8
FROM trip_logs tl
WHERE tl.title = '제주 해녀 이야기와 바다 밥상'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 1, 1,
       '이른 시간이라 사람이 많지 않았고, 능선 너머로 올라오는 빛이 아주 선명했습니다.',
       '/images/img_seongsan.jpg', '성산일출봉', '관광지', '/images/img_seongsan.jpg', 5.0
FROM trip_logs tl
WHERE tl.title = '성산에서 시작해 고기국수로 마무리한 제주'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 1);

INSERT INTO trip_place_logs (trip_log_id, place_id, visit_order, day_number, review_content, image_url, place_title, place_category, place_image, rating)
SELECT tl.id, NULL, 2, 1,
       '여행 첫 끼로 든든했고, 국물이 깔끔해서 아침 일정 뒤 먹기 좋았습니다.',
       '/images/img_noodle.jpg', '제주 고기국수', '맛집', '/images/img_noodle.jpg', 4.7
FROM trip_logs tl
WHERE tl.title = '성산에서 시작해 고기국수로 마무리한 제주'
  AND NOT EXISTS (SELECT 1 FROM trip_place_logs WHERE trip_log_id = tl.id AND visit_order = 2);

-- Friendly comments
INSERT INTO trip_log_comments (trip_log_id, user_id, content, created_at, updated_at)
SELECT tl.id, u.id, '사진 색감이 정말 밝아서 시연 화면에 딱 좋네요. 코스도 따라가 보고 싶어요!', NOW() - INTERVAL 21 HOUR, NOW() - INTERVAL 21 HOUR
FROM trip_logs tl JOIN users u ON u.email = 'demo.soyeon@coursekok.test'
WHERE tl.title = '제주 동쪽에서 만난 가장 맑은 2박 3일'
  AND NOT EXISTS (SELECT 1 FROM trip_log_comments WHERE trip_log_id = tl.id AND user_id = u.id);

INSERT INTO trip_log_comments (trip_log_id, user_id, content, created_at, updated_at)
SELECT tl.id, u.id, '강릉 당일치기 코스로 저장해둘게요. 커피거리랑 경포호 조합이 좋아 보여요.', NOW() - INTERVAL 31 HOUR, NOW() - INTERVAL 31 HOUR
FROM trip_logs tl JOIN users u ON u.email = 'demo.minji@coursekok.test'
WHERE tl.title = '강릉 커피향 따라 걷는 파란 바다 하루'
  AND NOT EXISTS (SELECT 1 FROM trip_log_comments WHERE trip_log_id = tl.id AND user_id = u.id);

INSERT INTO trip_log_comments (trip_log_id, user_id, content, created_at, updated_at)
SELECT tl.id, u.id, '부산 주말 여행 분위기가 생생해요. 시장 코스는 꼭 넣어봐야겠어요.', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY
FROM trip_logs tl JOIN users u ON u.email = 'demo.doyun@coursekok.test'
WHERE tl.title = '부산 바다와 시장을 오간 맛있는 주말'
  AND NOT EXISTS (SELECT 1 FROM trip_log_comments WHERE trip_log_id = tl.id AND user_id = u.id);

INSERT INTO trip_log_comments (trip_log_id, user_id, content, created_at, updated_at)
SELECT tl.id, u.id, '협재 노을 사진이 너무 예뻐요. 여유로운 일정이라 더 끌립니다.', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY
FROM trip_logs tl JOIN users u ON u.email = 'demo.yuri@coursekok.test'
WHERE tl.title = '협재의 투명한 물빛과 노을 산책'
  AND NOT EXISTS (SELECT 1 FROM trip_log_comments WHERE trip_log_id = tl.id AND user_id = u.id);

INSERT INTO trip_log_comments (trip_log_id, user_id, content, created_at, updated_at)
SELECT tl.id, u.id, '동백꽃 코스 가족 여행으로 좋겠네요. 밝은 사진들이 보기 좋아요.', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY
FROM trip_logs tl JOIN users u ON u.email = 'demo.hana@coursekok.test'
WHERE tl.title = '동백꽃 사이로 걸은 제주 오후'
  AND NOT EXISTS (SELECT 1 FROM trip_log_comments WHERE trip_log_id = tl.id AND user_id = u.id);

-- Likes and bookmarks. Counts above are intentionally larger to make the demo feed lively.
INSERT IGNORE INTO trip_log_likes (trip_log_id, user_id, created_at)
SELECT tl.id, u.id, NOW() - INTERVAL 6 HOUR
FROM trip_logs tl
JOIN users u ON u.email IN (
  'demo.hana@coursekok.test',
  'demo.jun@coursekok.test',
  'demo.soyeon@coursekok.test',
  'demo.minji@coursekok.test',
  'demo.doyun@coursekok.test',
  'demo.yuri@coursekok.test'
)
WHERE tl.is_public = true AND tl.user_id <> u.id;

INSERT IGNORE INTO trip_log_bookmarks (trip_log_id, user_id, created_at)
SELECT tl.id, u.id, NOW() - INTERVAL 5 HOUR
FROM trip_logs tl
JOIN users u ON u.email IN (
  'demo.hana@coursekok.test',
  'demo.jun@coursekok.test',
  'demo.soyeon@coursekok.test',
  'demo.minji@coursekok.test',
  'demo.doyun@coursekok.test',
  'demo.yuri@coursekok.test'
)
WHERE tl.is_public = true
  AND tl.user_id <> u.id
  AND tl.region IN ('제주', '강릉');

COMMIT;


