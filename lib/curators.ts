export type CuratorId = 'eric' | 'clair' | 'james' | 'hana' | 'leo' | 'mina' | 'owen' | 'yuna'

export interface CuratorProfile {
  id: CuratorId
  name: string
  label: string
  personality: string
  emphasis: string
  image: string
}

const CURATORS: Record<CuratorId, CuratorProfile> = {
  eric: {
    id: 'eric',
    name: 'Eric',
    label: '30대 초반 남성 큐레이터 Eric',
    personality: '꼼꼼한 리서처',
    emphasis: '스펙, 비교, 데이터',
    image: '/images/curators/eric.png',
  },
  clair: {
    id: 'clair',
    name: 'Clair',
    label: '20대 중반 여성 큐레이터 Clair',
    personality: '센스있는 선물러',
    emphasis: '감성, 패키징, 받는 사람 반응',
    image: '/images/curators/clair.png',
  },
  james: {
    id: 'james',
    name: 'James',
    label: '40대 초반 남성 큐레이터 James',
    personality: '넉넉한 형/선배',
    emphasis: '격, 품질, 브랜드',
    image: '/images/curators/james.png',
  },
  hana: {
    id: 'hana',
    name: 'Hana',
    label: '30대 중반 여성 큐레이터 Hana',
    personality: '현실적 살림러',
    emphasis: '가성비, 실용성, 경험',
    image: '/images/curators/hana.png',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    label: '20대 후반 남성 큐레이터 Leo',
    personality: '활동적인 행동파',
    emphasis: '실사용, 내구성, 기능',
    image: '/images/curators/leo.png',
  },
  mina: {
    id: 'mina',
    name: 'Mina',
    label: '30대 초반 여성 큐레이터 Mina',
    personality: '안목있는 디자이너',
    emphasis: '디자인, 공간, 분위기',
    image: '/images/curators/mina.png',
  },
  owen: {
    id: 'owen',
    name: 'Owen',
    label: '30대 중반 남성 큐레이터 Owen',
    personality: '사려깊은 이야기꾼',
    emphasis: '의미, 맥락, 관계',
    image: '/images/curators/owen.png',
  },
  yuna: {
    id: 'yuna',
    name: 'Yuna',
    label: '20대 중반 여성 큐레이터 Yuna',
    personality: '트렌드 리서처',
    emphasis: '최신 트렌드, 반응, 화제성',
    image: '/images/curators/yuna.png',
  },
}

export function getCuratorProfile(id: string): CuratorProfile | null {
  return CURATORS[id as CuratorId] || null
}
