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
    visualHint: 'neat short hair, wearing glasses, slight smile, clean-shaven',
  },
  {
    id: 'clair',
    name: 'Clair',
    gender: 'female',
    age: 'mid 20s',
    personality: '센스있는 선물러',
    visualHint: 'bob cut hair, bright smile, small earrings',
  },
  {
    id: 'james',
    name: 'James',
    gender: 'male',
    age: 'early 40s',
    personality: '넉넉한 형/선배',
    visualHint: 'short hair, short beard, confident warm expression, mature look',
  },
  {
    id: 'hana',
    name: 'Hana',
    gender: 'female',
    age: 'mid 30s',
    personality: '현실적 살림러',
    visualHint: 'hair tied back in ponytail, friendly natural smile',
  },
  {
    id: 'leo',
    name: 'Leo',
    gender: 'male',
    age: 'late 20s',
    personality: '활동적인 행동파',
    visualHint: 'normal short hair, relaxed natural smile, casual everyday look',
  },
  {
    id: 'mina',
    name: 'Mina',
    gender: 'female',
    age: 'early 30s',
    personality: '안목있는 디자이너',
    visualHint: 'long straight hair, minimal makeup, elegant and calm expression',
  },
  {
    id: 'owen',
    name: 'Owen',
    gender: 'male',
    age: 'mid 30s',
    personality: '사려깊은 이야기꾼',
    visualHint: 'medium wavy hair, gentle thoughtful smile, soft eyes',
  },
  {
    id: 'yuna',
    name: 'Yuna',
    gender: 'female',
    age: 'mid 20s',
    personality: '트렌드 리서처',
    visualHint: 'layered medium hair, playful smile, trendy bangs',
  },
]

async function generateProfile(curator: CuratorInfo): Promise<void> {
  const outputPath = path.join(outputDir, `${curator.id}.png`)
  if (fs.existsSync(outputPath)) {
    console.log(`  스킵 (이미 존재): ${curator.id}`)
    return
  }

  const prompt = `Simple black and white line drawing portrait of an ordinary everyday Korean ${curator.gender}, ${curator.age}. Natural Korean face: straight black hair, small nose, natural eyes, oval face. ${curator.visualHint}. Looking like someone you would see on a Korean street, not a model or celebrity. Very ordinary and approachable. Style: bold black ink lines on pure white background, minimal detail, hand-drawn sketch, Korean webtoon style. Head and shoulders only. Thick outlines, no shading, no gray, no color. No text. Square.`

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
