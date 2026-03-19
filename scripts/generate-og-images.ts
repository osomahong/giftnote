import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'

const API_KEY = process.env.GOOGLE_AI_API_KEY
if (!API_KEY) {
  console.error('GOOGLE_AI_API_KEY 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })
const collectionsDir = path.join(process.cwd(), 'content/collections')
const outputDir = path.join(process.cwd(), 'public/og')
const bgPath = path.join(outputDir, '_bg.png')

fs.mkdirSync(outputDir, { recursive: true })

interface CollectionMeta {
  slug: string
  title: string
  interest: string
  occasion: string
}

function loadCollections(): CollectionMeta[] {
  if (!fs.existsSync(collectionsDir)) return []
  return fs.readdirSync(collectionsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(collectionsDir, f), 'utf8')
      const { data } = matter(content)
      return {
        slug: f.replace('.md', ''),
        title: data.title as string,
        interest: data.interest as string,
        occasion: data.occasion as string,
      }
    })
}

async function generateBackground(): Promise<Buffer> {
  if (fs.existsSync(bgPath)) {
    console.log('배경 이미지 캐시 사용:', bgPath)
    return fs.readFileSync(bgPath)
  }

  console.log('배경 이미지 생성 중 (나노바나나2)...')
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [{
      role: 'user',
      parts: [{ text: 'Minimal elegant gift wrapping paper texture, soft warm beige and cream tones, subtle geometric patterns, clean modern design, no text, no objects, abstract background for editorial magazine cover, 1200x630 resolution' }],
    }],
    config: {
      responseModalities: ['image', 'text'],
    },
  })

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('image/')
  )
  if (!imagePart?.inlineData?.data) {
    throw new Error('이미지 생성 실패')
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
  const resized = await sharp(buffer)
    .resize(1200, 630, { fit: 'cover' })
    .png()
    .toBuffer()

  fs.writeFileSync(bgPath, resized)
  console.log('배경 이미지 저장 완료:', bgPath)
  return resized
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    current += char
    if (current.length >= maxCharsPerLine) {
      const lastSpace = current.lastIndexOf(' ')
      if (lastSpace > 0 && current.length - lastSpace < 8) {
        lines.push(current.substring(0, lastSpace).trim())
        current = current.substring(lastSpace + 1)
      } else {
        lines.push(current.trim())
        current = ''
      }
    }
  }
  if (current.trim()) lines.push(current.trim())
  return lines
}

async function createOgImage(bgBuffer: Buffer, collection: CollectionMeta): Promise<void> {
  const outputPath = path.join(outputDir, `${collection.slug}.png`)
  if (fs.existsSync(outputPath)) {
    console.log(`  스킵 (이미 존재): ${collection.slug}`)
    return
  }

  const titleLines = wrapText(collection.title, 16)
  const titleY = 260 - (titleLines.length - 1) * 30
  const titleSvg = titleLines
    .map((line, i) => `<text x="600" y="${titleY + i * 68}" text-anchor="middle" font-family="'Noto Serif KR', serif" font-size="48" font-weight="700" fill="#1A1916">${escapeXml(line)}</text>`)
    .join('\n')

  const svgOverlay = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#F7F7F5" stop-opacity="0.92"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#overlay)"/>

      <!-- 상단 브랜드 -->
      <text x="600" y="120" text-anchor="middle" font-family="serif" font-size="24" font-weight="700" fill="#C8612A">giftNote</text>
      <line x1="560" y1="140" x2="640" y2="140" stroke="#C8612A" stroke-width="1.5"/>

      <!-- 제목 -->
      ${titleSvg}

      <!-- 하단 -->
      <text x="600" y="520" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#6B6860">마음을 전하는 선물 큐레이션</text>
      <rect x="500" y="550" width="200" height="3" rx="1.5" fill="#C8612A" opacity="0.5"/>
    </svg>
  `

  await sharp(bgBuffer)
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0,
    }])
    .png()
    .toFile(outputPath)

  console.log(`  생성 완료: ${collection.slug}.png`)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function generateThumbnail(collection: CollectionMeta): Promise<void> {
  const thumbPath = path.join(outputDir, `_thumb-${collection.slug}.png`)
  if (fs.existsSync(thumbPath)) {
    console.log(`  썸네일 스킵 (이미 존재): ${collection.slug}`)
    return
  }

  console.log(`  썸네일 생성 중: ${collection.slug}...`)
  const prompt = `Colorful flat editorial illustration for a gift guide about "${collection.interest}" for "${collection.occasion}". Warm cream background (#FDF8F3), modern flat style, vibrant but soft colors, no text, no letters, no words, square composition, clean minimal design suitable for a magazine thumbnail.`

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
    throw new Error('썸네일 이미지 생성 실패')
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
  const resized = await sharp(buffer)
    .resize(800, 600, { fit: 'cover' })
    .png()
    .toBuffer()

  fs.writeFileSync(thumbPath, resized)
  console.log(`  썸네일 저장 완료: _thumb-${collection.slug}.png`)
}

async function main() {
  console.log('=== OG 이미지 생성 시작 ===\n')

  const collections = loadCollections()
  console.log(`${collections.length}개 컬렉션 발견\n`)

  console.log('썸네일 일러스트 생성 중...')
  for (const collection of collections) {
    try {
      await generateThumbnail(collection)
    } catch (err) {
      console.error(`  썸네일 실패: ${collection.slug}:`, err)
    }
  }

  let bgBuffer: Buffer
  try {
    bgBuffer = await generateBackground()
  } catch (err) {
    console.error('배경 이미지 생성 실패, 단색 배경으로 대체합니다:', err)
    bgBuffer = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: { r: 247, g: 247, b: 245 },
      }
    }).png().toBuffer()
    fs.writeFileSync(bgPath, bgBuffer)
  }

  console.log('\nOG 이미지 생성 중...')
  for (const collection of collections) {
    try {
      await createOgImage(bgBuffer, collection)
    } catch (err) {
      console.error(`  실패: ${collection.slug}:`, err)
    }
  }

  console.log('\n=== OG 이미지 생성 완료 ===')
}

main()
