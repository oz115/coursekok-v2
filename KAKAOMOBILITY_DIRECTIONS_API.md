# Kakao Mobility Directions API (자동차 길찾기) 개발 가이드

본 가이드는 카카오 모빌리티의 **자동차 길찾기 API (Directions API)**를 AI Agent 및 개발자가 손쉽게 이해하고 적용할 수 있도록 핵심 명세를 요약·정리한 문서입니다.

---

## 1. API 기본 정보

*   **HTTP Method**: `GET`
*   **Request URL**: `https://apis-navi.kakaomobility.com/v1/directions`
*   **인증 및 요청 헤더 (Headers)**:
    *   `Authorization`: `KakaoAK {REST_API_KEY}` (카카오 디벨로퍼스에서 발급받은 REST API 키 지정)
    *   `Content-Type`: `application/json`

---

## 2. 요청 파라미터 (Query Parameters)

| 파라미터명 | 타입 | 필수 여부 | 설명 및 포맷 |
| :--- | :--- | :--- | :--- |
| **`origin`** | String | **필수** | **출발지 좌표 및 이름**<br>형식 1: `{경도},{위도},name={이름}` (예: `127.111202,37.394912,name=판교역`) <br>형식 2: `{경도},{위도}` (예: `127.111202,37.394912`) |
| **`destination`** | String | **필수** | **목적지 좌표 및 이름** (형식은 `origin`과 동일) |
| **`waypoints`** | String | 선택 | **경유지 목록** (최대 5개까지 허용)<br>각 경유지는 `\|` (또는 URL 인코딩 문자 `%7C`)로 구분하여 연결합니다.<br>예: `127.111202,37.394912,name=경유지1\|127.112275,37.392815` |
| **`priority`** | String | 선택 | **경로 탐색 우선순위**<br>`RECOMMEND` (추천 경로 - 기본값), `TIME` (최단 시간), `DISTANCE` (최단 경로) |
| **`avoid`** | String | 선택 | **경로 탐색 제외 조건** (`\|`로 다중 선택 가능)<br>`ferries` (페리 항로), `toll` (유료 도로), `motorway` (자동차 전용 도로), `schoolzone` (어린이 보호 구역), `uturn` (유턴) |
| **`roadevent`** | Int | 선택 | **실시간 유고 통제 정보 반영 여부**<br>`0`: 전체 차선 통제 반영 (기본값), `1`: 출발지/목적지 주변 통제 제외, `2`: 모든 구간 통제 제외 |
| **`alternatives`** | Boolean | 선택 | **대안 경로 제공 여부** (`true` / `false` (기본값)) |
| **`road_details`** | Boolean | 선택 | **상세 도로 정보 반환 여부** (`true` / `false` (기본값)) |
| **`car_type`** | Int | 선택 | **차종 구분** (기본값: `1` - 승용차) |
| **`car_fuel`** | String | 선택 | **차량 유종** (`GASOLINE` (기본값), `DIESEL`, `LPG`) |
| **`car_hipass`** | Boolean | 선택 | **하이패스 장착 여부** (`true` / `false` (기본값)) |
| **`summary`** | Boolean | 선택 | **응답 상세도 범위 설정**<br>`true`: 요약 정보만 반환 (`sections` 하위 상세 정보 제외)<br>`false`: 요약 + 상세 정보 모두 반환 (기본값) |

---

## 3. 요청 예시 (curl)

```bash
curl -X GET "https://apis-navi.kakaomobility.com/v1/directions?origin=127.111202,37.394912,name=출발지&destination=127.110563,37.394196,name=목적지&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false" \
  -H "Authorization: KakaoAK {REST_API_KEY}"
```

---

## 4. 응답 데이터 구조 (JSON)

성공 응답 시 가장 중요한 루트 객체 구조와 자주 사용되는 주요 데이터 필드는 다음과 같습니다.

### 1) 응답 최상위 필드
*   `trans_id` (String): 경로 요청 고유 ID.
*   `routes` (Array): 경로 탐색 결과 목록 (일반적으로 `routes[0]`에 주 경로가 담김).

### 2) `routes[0]` 하위 주요 구조
```json
{
  "trans_id": "01948280...",
  "routes": [
    {
      "result_code": 0,          // 0 이면 탐색 성공 (에러 코드는 별도 정의)
      "result_msg": "길찾기 성공",
      "summary": {
        "origin": { "name": "출발지", "x": 127.111202, "y": 37.394912 },
        "destination": { "name": "목적지", "x": 127.110563, "y": 37.394196 },
        "fare": {
          "taxi": 3800,          // 예상 택시 요금 (원)
          "toll": 1000           // 예상 통행료 (원)
        },
        "distance": 1540,        // 전체 경로 총 거리 (미터 단위)
        "duration": 240          // 전체 경로 총 소요 시간 (초 단위)
      },
      "sections": [              // 구간별 경로 상세 (경유지 수 + 1 개 만큼 제공)
        {
          "distance": 1540,      // 해당 구간의 거리 (미터)
          "duration": 240,       // 해당 구간의 소요 시간 (초)
          "roads": [             // 해당 구간을 이루는 도로 목록
            {
              "name": "대왕판교로",
              "distance": 450,
              "duration": 45,
              "traffic_speed": 40.5,
              "vertexes": [      // Polyline을 그리기 위한 x, y 좌표의 1차원 플랫 배열
                127.111202, 37.394912,
                127.111250, 37.394850
              ]
            }
          ],
          "guides": [            // 턴바이턴 안내 지점 목록
            {
              "name": "판교역 방향",
              "x": 127.111202,
              "y": 37.394912,
              "distance": 0,
              "duration": 0,
              "guidance": "직진하십시오"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. AI Agent가 개발에 적용할 때의 핵심 Checklist

1.  **좌표계 매핑**: 카카오 API의 x좌표는 **경도(Longitude)**이고 y좌표는 **위도(Latitude)**입니다. 맵핑 시 순서가 뒤바뀌지 않도록 주의해야 합니다.
2.  **경유지 최대치 주의**: 경유지(`waypoints`)는 최대 **5개**까지만 지원합니다. 하루 여정의 장소가 5개를 넘을 경우 API를 분할 호출해야 합니다.
3.  **경로 렌더링 (Polyline)**: 
    *   지도 상에 이동 경로를 정교하게 그리려면 `sections` -> `roads` -> `vertexes` 배열에 포함된 플랫한 경위도 좌표 목록을 순차적으로 묶어 카카오맵 Polyline 객체의 경로로 대입합니다.
4.  **요금 정보 가공**:
    *   `summary.fare.taxi`는 택시 요금 예측 정보로 활용 가능하며, `summary.fare.toll`은 자차 이동 시의 통행료 경비 계산에 사용 가능합니다.
5.  **소요 시간 포맷**:
    *   `duration` 필드는 초(second) 단위이므로 프론트엔드에 노출할 때는 `Math.round(duration / 60)` 분 등으로 포맷팅해야 합니다.
