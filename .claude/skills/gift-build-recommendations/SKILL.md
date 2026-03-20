# gift-build-recommendations

정적 추천 시스템을 빌드. `generated/recommendations.json` 생성.

## 추천 우선순위 (성별/연령 최우선)
1. 같은 성별 (가중치 5) — 여성 선물끼리, 남성 선물끼리
2. 같은 연령대 (가중치 4) — 정확히 같으면 4, 같은 세대면 2
3. 같은 상황 (가중치 3) — 생일끼리, 기념일끼리
4. 같은 관심사 (가중치 2)
5. 같은 예산 × 다른 페르소나 (가중치 1)
6. 공유 태그 보너스 (태그당 0.5)

## 실행
```bash
tsx scripts/build-recommendations.ts
```

## 출력
- `generated/recommendations.json`: slug → 추천 6개 배열
