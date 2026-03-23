'use client'

import { useState } from 'react'
import { CategoryGroup } from './CategoryGroup'
import type { Collection } from '@/lib/types'

interface GroupData {
  label: string
  emoji: string
  tagSlug: string
  items: Collection[]
}

interface CategoryTabsProps {
  byOccasion: GroupData[]
  byTarget: GroupData[]
  byBudget: GroupData[]
}

const TABS = [
  { key: 'occasion', label: '상황별' },
  { key: 'target', label: '대상별' },
  { key: 'budget', label: '예산별' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function CategoryTabs({ byOccasion, byTarget, byBudget }: CategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('occasion')

  const panels: Record<TabKey, GroupData[]> = {
    occasion: byOccasion,
    target: byTarget,
    budget: byBudget,
  }

  return (
    <div>
      {/* 탭 버튼 */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface border border-border/50 text-text-secondary hover:border-accent/50 hover:text-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 패널 — SEO를 위해 모두 DOM에 렌더링, 비활성은 hidden */}
      {TABS.map((tab) => (
        <div
          key={tab.key}
          className={activeTab === tab.key ? '' : 'hidden'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {panels[tab.key].map((group) => (
              <CategoryGroup
                key={group.tagSlug}
                label={group.label}
                emoji={group.emoji}
                tagSlug={group.tagSlug}
                items={group.items}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
