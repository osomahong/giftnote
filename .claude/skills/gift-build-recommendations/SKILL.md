# gift-build-recommendations

정적 추천 시스템을 빌드. `generated/recommendations.json` 생성.

## 추천 우선순위
1. 같은 예산 × 다른 페르소나 (가중치 3)
2. 같은 페르소나 × 인접 예산 (가중치 2)
3. 같은 상황 × 다른 예산 (가중치 1)
4. 공유 태그 보너스 (태그당 0.5)

## 실행
```bash
tsx scripts/build-recommendations.ts
```

## 출력
- `generated/recommendations.json`: slug → 추천 6개 배열
