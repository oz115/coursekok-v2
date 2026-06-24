<script setup>
import { ref } from 'vue'
import { savePlace, deleteSavedPlace } from '@/api/savedPlace'

// 로컬 테스트용 가상 장소 데이터 및 찜 상태
const places = ref([
  { id: 1001, title: '경복궁', address: '서울특별시 종로구 사직로 161', image: 'https://cdn.visitkorea.or.kr/img/gyeongbokgung.jpg' },
  { id: 1002, title: '해운대 해수욕장', address: '부산광역시 해운대구 우동', image: 'https://cdn.visitkorea.or.kr/img/haeundae.jpg' },
  { id: 1003, title: '제주 성산일출봉', address: '제주특별자치도 서귀포시 성산읍 성산리 1', image: 'https://cdn.visitkorea.or.kr/img/seongsan.jpg' }
])

// 현재 로그인한 유저가 바구니에 담은 장소 ID 목록 (Set)
const basket = ref(new Set())
const isLoading = ref(false)

/**
 * 장소 카드의 '바구니 버튼' 클릭 핸들러
 * - 이미 바구니에 담긴 장소이면 삭제 API 호출
 * - 바구니에 없는 장소이면 추가 API 호출
 */
const handleBasketClick = async (place) => {
  if (isLoading.value) return
  isLoading.value = true

  const isSaved = basket.value.has(place.id)

  try {
    if (isSaved) {
      // 1. 이미 바구니에 담긴 장소 -> 삭제 요청
      await deleteSavedPlace(place.id)
      
      const updatedBasket = new Set(basket.value)
      updatedBasket.delete(place.id)
      basket.value = updatedBasket
      
      alert(`[${place.title}] 장소를 바구니에서 제거했습니다.`)
    } else {
      // 2. 바구니에 담기지 않은 장소 -> 추가 요청
      await savePlace(place.id)
      
      const updatedBasket = new Set(basket.value)
      updatedBasket.add(place.id)
      basket.value = updatedBasket
      
      alert(`[${place.title}] 장소를 바구니에 추가했습니다.`)
    }
  } catch (error) {
    console.error('바구니 처리 중 오류 발생:', error)
    
    // 글로벌 예외 처리기에서 반환하는 400 Bad Request 에러 메시지 노출
    if (error.response && error.response.status === 400) {
      alert(error.response.data.message || '이미 바구니에 담긴 장소입니다.')
    } else if (error.response && error.response.status === 401) {
      alert('로그인이 필요한 서비스입니다.')
    } else {
      alert('요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="example-container">
    <h2>바구니(찜하기) 연동 예시 화면</h2>
    <p class="description">
      백엔드의 <code>POST /api/saved-places</code> 및 <code>DELETE /api/saved-places</code> API를 호출하여 실시간으로 바구니에 담긴 상태를 관리합니다.
    </p>

    <div class="places-grid">
      <div v-for="place in places" :key="place.id" class="place-card">
        <div class="place-image" :style="{ backgroundImage: `url(${place.image})` }">
          <!-- 바구니(찜) 버튼 -->
          <button 
            class="basket-btn" 
            :class="{ 'is-saved': basket.has(place.id) }"
            @click="handleBasketClick(place)"
            :disabled="isLoading"
            aria-label="바구니 담기 토글"
          >
            <span class="heart-icon">{{ basket.has(place.id) ? '❤️' : '🤍' }}</span>
          </button>
        </div>
        <div class="place-info">
          <h3>{{ place.title }}</h3>
          <p class="address">{{ place.address }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 24px;
  background: var(--bg-primary, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', sans-serif;
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #666666;
  margin-bottom: 24px;
}

code {
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.place-card {
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #ffffff;
}

.place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.place-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.basket-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s, background-color 0.2s;
}

.basket-btn:hover {
  transform: scale(1.1);
  background: #ffffff;
}

.basket-btn:active {
  transform: scale(0.95);
}

.basket-btn.is-saved {
  background: #fff0f0;
}

.heart-icon {
  font-size: 16px;
}

.place-info {
  padding: 16px;
}

.place-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.place-info .address {
  font-size: 13px;
  color: #777777;
  margin: 0;
}
</style>
