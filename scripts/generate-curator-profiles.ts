/**
 * Gemini 이미지 생성으로 큐레이터 프로필 일러스트 생성
 *
 * 사용법: npx tsx scripts/generate-curator-profiles.ts
 */

import fs from 'fs'
import path from 'path'
import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'

const API_KEY = process.env.GOOGLE_AI_API_KEY
if (!API_KEY) {
  console.error('GOOGLE_AI_API_KEY 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })
const outputDir = path.join(process.cwd(), 'public', 'images', 'curators')
fs.mkdirSync(outputDir, { recursive: true })

interface CuratorInfo {
  id: string
  name: string
  gender: string
  age: string
  personality: string
  visualHint: string
}

const CURATORS: CuratorInfo[] = [
  {
    id: 'eric',
    name: 'Eric',
    gender: 'male',
    age: 'early 30s',
    personality: '꼼꼼한 리서처',
    visualHint: 'neat short hair, glasses, smart casual outfit with a collared shirt, holding a tablet, analytical and organized look',
  },
  {
    id: 'clair',
    name: 'Clair',
    gender: 'female',
    age: 'mid 20s',
    personality: '센스있는 선물러',
    visualHint: 'stylish bob hair, warm smile, wearing a soft knit sweater, holding a wrapped gift box, cheerful and fashionable',
  },
  {
    id: 'james',
    name: 'James',
    gender: 'male',
    age: 'early 40s',
    personality: '넉넉한 형/선배',
    visualHint: 'well-groomed short hair, slight beard, wearing a navy blazer over turtleneck, confident and mature, warm expression',
  },
  {
    id: 'hana',
    name: 'Hana',
    gender: 'female',
    age: 'mid 30s',
    personality: '현실적 살림러',
    visualHint: 'shoulder-length hair tied back, comfortable apron over casual clothes, holding a kitchen utensil, practical and friendly',
  },
  {
    id: 'leo',
    name: 'Leo',
    gender: 'male',
    age: 'late 20s',
    personality: '활동적인 행동파',
    visualHint: 'athletic build, sporty short hair, wearing a hoodie and sneakers, energetic pose, holding a gym bag, active lifestyle',
  },
  {
    id: 'mina',
    name: 'Mina',
    gender: 'female',
    age: 'early 30s',
    personality: '안목있는 디자이너',
    visualHint: 'sleek long hair, minimalist outfit in black and white, wearing designer earrings, holding a coffee cup, sophisticated and artistic',
  },
  {
    id: 'owen',
    name: 'Owen',
    gender: 'male',
    age: 'mid 30s',
    personality: '사려깊은 이야기꾼',
    visualHint: 'gentle medium-length hair, wearing a cozy cardigan, holding a book, thoughtful expression, warm and literary atmosphere',
  },
  {
    id: 'yuna',
    name: 'Yuna',
    gender: 'female',
    age: 'mid 20s',
    personality: '트렌드 리서처',
    visualHint: 'trendy layered hair, wearing a cropped jacket, holding a smartphone, modern and energetic, social media savvy look',
  },
]

async function generateProfile(curator: CuratorInfo): Promise<void> {
  const outputPath = path.join(outputDir, `${curator.id}.png`)
  if (fs.existsSync(outputPath)) {
    console.log(`  스킵 (이미 존재): ${curator.id}`)
    return
  }

  const prompt = `Create a character illustration profile picture of a Korean ${curator.gender}, ${curator.age}. ${curator.visualHint}. Style: modern flat illustration with soft pastel colors, clean lines, white background, portrait bust shot, friendly and approachable. No text, no letters, no words. Square composition.`

  console.log(`  생성 중: ${curator.id} (${curator.name})...`)

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [{
      role: 'user',
      parts: [{ text: prompt }],
    }],
    config: {
      responseModalities: ['image', 'text'],
    },
  })

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('image/')
  )
  if (!imagePart?.inlineData?.data) {
    console.error(`  ❌ 생성 실패: ${curator.id}`)
    return
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
  const resized = await sharp(buffer)
    .resize(256, 256, { fit: 'cover' })
    .png()
    .toBuffer()

  fs.writeFileSync(outputPath, resized)
  console.log(`  ✅ 저장 완료: ${curator.id}.png`)
}

async function main() {
  console.log('=== 큐레이터 프로필 일러스트 생성 ===\n')

  for (const curator of CURATORS) {
    try {
      await generateProfile(curator)
    } catch (err) {
      console.error(`  ❌ 에러: ${curator.id}:`, (err as Error).message)
    }
  }

  console.log('\n=== 완료 ===')
}

main()
