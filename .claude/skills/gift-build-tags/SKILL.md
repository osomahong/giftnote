# gift-build-tags

태그 인덱스를 빌드. `generated/tag-index.json` 생성.

## 실행
```bash
tsx scripts/build-tag-index.ts
```

## 출력
- `generated/tag-index.json`: tag → slug 배열 매핑
- 모든 published 컬렉션의 태그를 수집
