export interface TagCategory {
  id: string
  label: string
  color: { bg: string; text: string }
  tags: string[]
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'occasion',
    label: '상황',
    color: { bg: 'bg-tag-occasion', text: 'text-tag-occasion-text' },
    tags: ['생일', '집들이', '승진축하', '결혼기념일', '졸업', '명절', '발렌타인', '화이트데이', '크리스마스', '어버이날', '스승의날', '출산', '입학', '퇴직', '개업'],
  },
  {
    id: 'persona',
    label: '받는 사람',
    color: { bg: 'bg-tag-persona', text: 'text-tag-persona-text' },
    tags: ['여자친구', '남자친구', '아내', '남편', '엄마', '아빠', '친구', '직장동료', '선배', '후배', '선생님', '시부모님', '장인장모님'],
  },
  {
    id: 'age',
    label: '연령대',
    color: { bg: 'bg-tag-persona', text: 'text-tag-persona-text' },
    tags: ['20대', '30대', '40대', '50대', '60대이상'],
  },
  {
    id: 'budget',
    label: '예산',
    color: { bg: 'bg-tag-budget', text: 'text-tag-budget-text' },
    tags: ['1만원대', '2만원대', '3만원대', '5만원대', '7만원대', '10만원대', '15만원이상'],
  },
  {
    id: 'style',
    label: '스타일',
    color: { bg: 'bg-[#F3EBF8]', text: 'text-[#7B3FA0]' },
    tags: ['실용적', '감성적', '유니크', '럭셔리', '가성비', '경험선물', '커스텀', '건강'],
  },
  {
    id: 'interest',
    label: '관심사',
    color: { bg: 'bg-[#FFF0F0]', text: 'text-[#C0392B]' },
    tags: ['스포츠', '뷰티', '테크', '독서', '요리', '인테리어', '패션', '캠핑', '반려동물', '음악', '게임', '여행'],
  },
]

export function getTagCategory(tag: string): TagCategory | undefined {
  return TAG_CATEGORIES.find(cat => cat.tags.includes(tag))
}

export function getTagStyle(tag: string): { bg: string; text: string } {
  const category = getTagCategory(tag)
  return category?.color ?? { bg: 'bg-bg-warm', text: 'text-text-secondary' }
}
